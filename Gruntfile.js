/*global module:false*/
"use strict";
module.exports = function(grunt) {
	require("load-grunt-tasks")(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		banner : [
			"/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n",
			"<%= pkg.homepage ? '* ' + pkg.homepage + '\\n' : '' %>",
			"* Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>;",
			" Licensed <%= _.pluck(pkg.licenses, 'type').join(", ") %> */\n"
		].join(""),
		jshint: {
			files: ["src/**/*.js" ],
			options: {
				jshintrc: true,
				reporter: require("jshint-stylish")
			}
		},
		concat: {
			options: {
				banner: "<%=banner%>\"use strict\";\n",
				process : function(src) {
					src = src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, "$1"); // remove "use strict";
					src = src.replace(/#__VERSION__#/g, grunt.config.data.pkg.version); // change version;
					return src;
				}
			},
			build: {
				src: ["src/*.js" ],
				dest: "dist/<%=pkg.outputname%>.js"
			}
		},
		uglify: {
			options: {
				banner: "<%=banner%>"
			},
			dist : {
				src: "dist/<%=pkg.outputname%>.js",
				dest: "dist/<%=pkg.outputname%>.min.js"
			}
		}
	});

	grunt.registerTask("default", ["jshint", "concat", "uglify"]);
};
