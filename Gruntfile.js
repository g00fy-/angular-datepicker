'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // configurable paths
  var yeomanConfig = {
    app : 'app',
    dist: 'dist'
  };

  try {
    yeomanConfig.app = require('./component.json').appPath || yeomanConfig.app;
  } catch (e) {
  }

  grunt.initConfig({
    yeoman : yeomanConfig,
    watch  : {
      livereload: {
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        tasks: ['livereload']
      }
    },
    connect: {
      options   : {
        port    : 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, yeomanConfig.app)
            ];
          }
        }
      },
      test      : {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'test')
            ];
          }
        }
      }
    },
    open   : {
      server: {
        url: 'http://localhost:<%= connect.options.port %>'
      }
    },
    clean  : {
      dist  : {
        files: [
          {
            dot: false,
            src: [
              '.tmp',
              '<%= yeoman.dist %>'
            ]
          }
        ]
      },
      server: '.tmp'
    },
    jshint : {
      options: {
        jshintrc: '.jshintrc'
      },
      all    : [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ]
    },
    karma  : {
      unit: {
        configFile: 'karma.conf.js',
        singleRun : true
      }
    },
    cssmin : {
      dist: {
        expand: true,
        cwd   : '<%= yeoman.dist %>',
        src   : ['*.css', '!*.min.css'],
        dest  : '<%= yeoman.dist %>',
        ext   : '.min.css'
      }
    },
    ngmin  : {
      dist: {
        expand: true,
        cwd   : '<%= yeoman.dist %>',
        src   : ['*.js', '!*.min.js'],
        dest  : '<%= yeoman.dist %>',
        ext   : '.min.js'
      }
    },
    uglify : {
      dist: {
        expand: true,
        cwd   : '<%= yeoman.dist %>',
        src   : ['*.min.js'],
        dest  : '<%= yeoman.dist %>',
        ext   : '.min.js'
      }
    },
    copy   : {
      dist: {
        files: [
          {
            expand : true,
            flatten: true,
            dot    : true,
            dest   : '<%= yeoman.dist %>',
            src    : [
              'README.md',
              'bower.json'
            ]
          }
        ]
      }
    },
    ngtemplates: {
      dist: {
        options: {
          base      : '<%= yeoman.app %>',
          module:     'datePicker'
        },
        src    : '<%= yeoman.app %>/templates/*.html',
        dest   : '.tmp/templates.js'
      }
    },
    concat: {
      options: {
        separator: '\n'
      },
      js: {
        src: ['<%= yeoman.app %>/scripts/module.js','.tmp/templates.js'],
        dest: '<%= yeoman.dist %>/index.js'
      },
      css: {
        src: ['<%= yeoman.app %>/styles/date.css'],
        dest: '<%= yeoman.dist %>/index.css'
      }
    }
  });

  grunt.renameTask('regarde', 'watch');

  grunt.registerTask('server', [
    'clean:server',
    'livereload-start',
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
    'clean:dist',
    'jshint',
    'ngtemplates',
    'concat',
    'cssmin',
    'ngmin',
    'uglify',
    'copy:dist'
  ]);

  grunt.registerTask('default', ['build']);
};
