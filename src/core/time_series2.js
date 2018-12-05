'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
var kbn_1 = require('app/core/utils/kbn');
var ticks_1 = require('./utils/ticks');
var lodash_1 = require('lodash');
function matchSeriesOverride(aliasOrRegex, seriesAlias) {
  if (!aliasOrRegex) {
    return false;
  }
  if (aliasOrRegex[0] === '/') {
    var regex = kbn_1.default.stringToJsRegex(aliasOrRegex);
    return seriesAlias.match(regex) != null;
  }
  return aliasOrRegex === seriesAlias;
}
function translateFillOption(fill) {
  return fill === 0 ? 0.001 : fill / 10;
}
/**
 * Calculate decimals for legend and update values for each series.
 * @param data series data
 * @param panel
 */
function updateLegendValues(data, panel) {
  for (var i = 0; i < data.length; i++) {
    var series = data[i];
    var yaxes = panel.yaxes;
    var seriesYAxis = series.yaxis || 1;
    var axis = yaxes[seriesYAxis - 1];
    var _a = ticks_1.getFlotTickDecimals(data, axis),
      tickDecimals = _a.tickDecimals,
      scaledDecimals = _a.scaledDecimals;
    var formater = kbn_1.default.valueFormats[panel.yaxes[seriesYAxis - 1].format];
    // decimal override
    if (lodash_1.default.isNumber(panel.decimals)) {
      series.updateLegendValues(formater, panel.decimals, null);
    } else {
      // auto decimals
      // legend and tooltip gets one more decimal precision
      // than graph legend ticks
      tickDecimals = (tickDecimals || -1) + 1;
      series.updateLegendValues(formater, tickDecimals, scaledDecimals + 2);
    }
  }
}
exports.updateLegendValues = updateLegendValues;
function getDataMinMax(data) {
  var datamin = null;
  var datamax = null;
  for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
    var series = data_1[_i];
    if (datamax === null || datamax < series.stats.max) {
      datamax = series.stats.max;
    }
    if (datamin === null || datamin > series.stats.min) {
      datamin = series.stats.min;
    }
  }
  return {datamin: datamin, datamax: datamax};
}
exports.getDataMinMax = getDataMinMax;
var TimeSeries = /** @class */ (function() {
  function TimeSeries(opts) {
    this.datapoints = opts.datapoints;
    this.label = opts.alias;
    this.id = opts.alias;
    this.alias = opts.alias;
    this.aliasEscaped = lodash_1.default.escape(opts.alias);
    this.color = opts.color;
    this.valueFormater = kbn_1.default.valueFormats.none;
    this.stats = {};
    this.legend = true;
    this.unit = opts.unit;
    this.hasMsResolution = this.isMsResolutionNeeded();
  }
  TimeSeries.prototype.applySeriesOverrides = function(overrides) {
    this.lines = {};
    this.dashes = {
      dashLength: [],
    };
    this.points = {};
    this.bars = {};
    this.yaxis = 1;
    this.zindex = 0;
    this.nullPointMode = null;
    delete this.stack;
    for (var i = 0; i < overrides.length; i++) {
      var override = overrides[i];
      if (!matchSeriesOverride(override.alias, this.alias)) {
        continue;
      }
      if (override.lines !== void 0) {
        this.lines.show = override.lines;
      }
      if (override.dashes !== void 0) {
        this.dashes.show = override.dashes;
        this.lines.lineWidth = 0;
      }
      if (override.points !== void 0) {
        this.points.show = override.points;
      }
      if (override.bars !== void 0) {
        this.bars.show = override.bars;
      }
      if (override.fill !== void 0) {
        this.lines.fill = translateFillOption(override.fill);
      }
      if (override.stack !== void 0) {
        this.stack = override.stack;
      }
      if (override.linewidth !== void 0) {
        this.lines.lineWidth = this.dashes.show ? 0 : override.linewidth;
        this.dashes.lineWidth = override.linewidth;
      }
      if (override.dashLength !== void 0) {
        this.dashes.dashLength[0] = override.dashLength;
      }
      if (override.spaceLength !== void 0) {
        this.dashes.dashLength[1] = override.spaceLength;
      }
      if (override.nullPointMode !== void 0) {
        this.nullPointMode = override.nullPointMode;
      }
      if (override.pointradius !== void 0) {
        this.points.radius = override.pointradius;
      }
      if (override.steppedLine !== void 0) {
        this.lines.steps = override.steppedLine;
      }
      if (override.zindex !== void 0) {
        this.zindex = override.zindex;
      }
      if (override.fillBelowTo !== void 0) {
        this.fillBelowTo = override.fillBelowTo;
      }
      if (override.color !== void 0) {
        this.color = override.color;
      }
      if (override.transform !== void 0) {
        this.transform = override.transform;
      }
      if (override.legend !== void 0) {
        this.legend = override.legend;
      }
      if (override.yaxis !== void 0) {
        this.yaxis = override.yaxis;
      }
    }
  };
  TimeSeries.prototype.getFlotPairs = function(fillStyle) {
    var result = [];
    this.stats.total = 0;
    this.stats.max = -Number.MAX_VALUE;
    this.stats.min = Number.MAX_VALUE;
    this.stats.logmin = Number.MAX_VALUE;
    this.stats.avg = null;
    this.stats.current = null;
    this.stats.first = null;
    this.stats.delta = 0;
    this.stats.diff = null;
    this.stats.range = null;
    this.stats.timeStep = Number.MAX_VALUE;
    this.allIsNull = true;
    this.allIsZero = true;
    var ignoreNulls = fillStyle === 'connected';
    var nullAsZero = fillStyle === 'null as zero';
    var currentTime;
    var currentValue;
    var nonNulls = 0;
    var previousTime;
    var previousValue = 0;
    var previousDeltaUp = true;
    for (var i = 0; i < this.datapoints.length; i++) {
      currentValue = this.datapoints[i][0];
      currentTime = this.datapoints[i][1];
      // Due to missing values we could have different timeStep all along the series
      // so we have to find the minimum one (could occur with aggregators such as ZimSum)
      if (previousTime !== undefined) {
        var timeStep = currentTime - previousTime;
        if (timeStep < this.stats.timeStep) {
          this.stats.timeStep = timeStep;
        }
      }
      previousTime = currentTime;
      if (currentValue === null) {
        if (ignoreNulls) {
          continue;
        }
        if (nullAsZero) {
          currentValue = 0;
        }
      }
      if (currentValue !== null) {
        if (lodash_1.default.isNumber(currentValue)) {
          this.stats.total += currentValue;
          this.allIsNull = false;
          nonNulls++;
        }
        if (currentValue > this.stats.max) {
          this.stats.max = currentValue;
        }
        if (currentValue < this.stats.min) {
          this.stats.min = currentValue;
        }
        if (this.stats.first === null) {
          this.stats.first = currentValue;
        } else {
          if (previousValue > currentValue) {
            // counter reset
            previousDeltaUp = false;
            if (i === this.datapoints.length - 1) {
              // reset on last
              this.stats.delta += currentValue;
            }
          } else {
            if (previousDeltaUp) {
              this.stats.delta += currentValue - previousValue; // normal increment
            } else {
              this.stats.delta += currentValue; // account for counter reset
            }
            previousDeltaUp = true;
          }
        }
        previousValue = currentValue;
        if (currentValue < this.stats.logmin && currentValue > 0) {
          this.stats.logmin = currentValue;
        }
        if (currentValue !== 0) {
          this.allIsZero = false;
        }
      }
      result.push([currentTime, currentValue]);
    }
    if (this.stats.max === -Number.MAX_VALUE) {
      this.stats.max = null;
    }
    if (this.stats.min === Number.MAX_VALUE) {
      this.stats.min = null;
    }
    if (result.length && !this.allIsNull) {
      this.stats.avg = this.stats.total / nonNulls;
      this.stats.current = result[result.length - 1][1];
      if (this.stats.current === null && result.length > 1) {
        this.stats.current = result[result.length - 2][1];
      }
    }
    if (this.stats.max !== null && this.stats.min !== null) {
      this.stats.range = this.stats.max - this.stats.min;
    }
    if (this.stats.current !== null && this.stats.first !== null) {
      this.stats.diff = this.stats.current - this.stats.first;
    }
    this.stats.count = result.length;
    return result;
  };
  TimeSeries.prototype.updateLegendValues = function(formater, decimals, scaledDecimals) {
    this.valueFormater = formater;
    this.decimals = decimals;
    this.scaledDecimals = scaledDecimals;
  };
  TimeSeries.prototype.formatValue = function(value) {
    if (!lodash_1.default.isFinite(value)) {
      value = null; // Prevent NaN formatting
    }
    return this.valueFormater(value, this.decimals, this.scaledDecimals);
  };
  TimeSeries.prototype.isMsResolutionNeeded = function() {
    for (var i = 0; i < this.datapoints.length; i++) {
      if (this.datapoints[i][1] !== null) {
        var timestamp = this.datapoints[i][1].toString();
        if (timestamp.length === 13 && timestamp % 1000 !== 0) {
          return true;
        }
      }
    }
    return false;
  };
  TimeSeries.prototype.hideFromLegend = function(options) {
    if (options.hideEmpty && this.allIsNull) {
      return true;
    }
    // ignore series excluded via override
    if (!this.legend) {
      return true;
    }
    // ignore zero series
    if (options.hideZero && this.allIsZero) {
      return true;
    }
    return false;
  };
  return TimeSeries;
})();
exports.default = TimeSeries;
