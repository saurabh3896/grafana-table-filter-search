# Table Panel - Native Plugin

The Table Panel is **included** with Grafana.

The table panel is very flexible, supporting both multiple modes for time series as well as for table, annotation and raw JSON data. It also provides date formatting and value formatting and coloring options.

#### Feature(s) added

* Quick-search bar to filter results from the table
* Word wrap feature for extra long text not fitting in a column

Check out the [Table Panel Showcase in the Grafana Playground](http://play.grafana.org/dashboard/db/table-panel-showcase) or read more about it here:

[http://docs.grafana.org/reference/table_panel/](http://docs.grafana.org/reference/table_panel/)

#### How to build from source

For development purposes, please make changes in the `src` folder's files. After running the commands below, the changes are reflected in the `dist` folder.

1.  `sudo npm install`

2.  `grunt`

First step installs required npm modules for executing the gruntfile and the second command executes it (clean, copy, typescript:build).
