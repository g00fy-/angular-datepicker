'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  // configurable paths
  var yeomanConfig = {
    app: 'app',
    dist: 'dist',
    tmp: '.tmp'
  };

  try {
    yeomanConfig.app = require('./component.json').appPath || yeomanConfig.app;
  } catch (e) {
  }

  grunt.initConfig({
    yeoman: yeomanConfig,
    watch: {
      less: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.less'],
        tasks: ['recess', 'copy:styles'],
        options: {
          nospawn: true
        }
      },
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
        tasks: ['copy:styles']
      },
      livereload: {
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '<%= yeoman.tmp %>/styles/{,*/}*.css',
          '{<%= yeoman.tmp %>,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    less: {
      options: {
        compile: true
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/styles',
            src: 'style.less',
            dest: '<%= yeoman.tmp %>/styles/',
            ext: '.css'
          }
        ]
      }
    },
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, yeomanConfig.tmp),
              mountFolder(connect, yeomanConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, yeomanConfig.tmp),
              mountFolder(connect, 'test')
            ];
          }
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>'
      }
    },
    clean: {
      dist: {
        files: [
          {
            dot: false,
            src: [
              '<%= yeoman.tmp %>',
              '<%= yeoman.dist %>'
            ]
          }
        ]
      },
      server: '<%= yeoman.tmp %>'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ]
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    cssmin: {
      dist: {
        expand: true,
        cwd: '<%= yeoman.dist %>',
        src: ['*.css', '!*.min.css'],
        dest: '<%= yeoman.dist %>',
        ext: '.min.css'
      }
    },
    ngmin: {
      dist: {
        expand: true,
        cwd: '<%= yeoman.dist %>',
        src: ['*.js', '!*.min.js'],
        dest: '<%= yeoman.dist %>',
        ext: '.min.js'
      }
    },
    uglify: {
      dist: {
        expand: true,
        cwd: '<%= yeoman.dist %>',
        src: ['*.min.js'],
        dest: '<%= yeoman.dist %>',
        ext: '.min.js'
      }
    },
    copy: {
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '<%= yeoman.tmp %>/styles/',
        src: '{,*/}*.css'
      }
    },
    ngtemplates: {
      dist: {
        options: {
          base: '<%= yeoman.app %>',
          module: 'datePicker'
        },
        src: '<%= yeoman.app %>/templates/*.html',
        dest: '<%= yeoman.tmp %>/templates.js'
      }
    },
    concurrent: {
      server: [
        'recess',
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles'
      ]
    },
    concat: {
      options: {
        separator: '\n'
      },
      js: {
        src: ['<%= yeoman.app %>/scripts/{datePicker,input,dateRange,datePickerUtils}.js', '<%= yeoman.tmp %>/templates.js'],
        dest: '<%= yeoman.dist %>/index.js',
        options: {
          banner:'\'use strict\';\n(function(angular){\n',
          footer:'})(angular);',
          // Replace all 'use strict' statements in the code with a single one at the top
          process: function(src) {
            return src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
          }
        }
      },
      css: {
        src: ['<%= yeoman.tmp %>/{,*/}*.css'],
        dest: '<%= yeoman.dist %>/index.css'
      }
    }
  });

  grunt.renameTask('regarde', 'watch');

  grunt.registerTask('server', [
    'clean:server',
    'recess',
    'concurrent:server',
    'connect:livereload',
    'open',
    'watch'
  ]);

  grunt.registerTask('test', [
    'clean:server',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'jshint',
    'clean:dist',
    'less',
    'ngtemplates',
    'concat',
    'cssmin',
    'ngmin',
    'uglify'
  ]);

  grunt.registerTask('default', ['build']);
};
