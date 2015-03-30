'use strict';

module.exports = function (grunt) {

  // :: lazy load grunt components
  require ('jit-grunt')(grunt, {
    express : 'grunt-express-server'
  });

  grunt.initConfig({

    pkg : grunt.file.readJSON('./package.json'),

    jshint : {
      source : {
        options : {
          reporter : require('jshint-stylish'),
          jshintrc : 'src/.jshintrc',
        },
        src : ['src/**/*.{js, es6}']
      }
    },

    browserify : {
      options : {
        banner : '/*! <%= pkg.name %> v<%= pkg.version %> | <%= pkg.author %> | license : <%= pkg.license %> */'
      },
      build : {
        options : {
          transform : ['babelify'],
          extensions : ['.js', '.es6']
        },
        src : 'src/audioclip.es6',
        dest : 'dist/audioclip.js'
      }
    },

    uglify : {
      build : {
        options : {
          preserveComments : 'some'
        },
        files : {
          'dist/audioclip.min.js' : 'dist/audioclip.js'
        }
      }
    },

    copy : {
      lib : {
        expand : true,
        cwd : 'dist/',
        src : '**',
        dest : 'test/assets/js/',
        flatten : true,
        filter : 'isFile'
      }
    },

    open : {
      test : {
        path : 'http://localhost:<%= express.options.port %>/index.html'
      }
    },

    express : {
      options : {
        port : process.env.PORT || 9000
      },
      dev : {
        options : {
          script : 'test/app-test.js',
          debug : true
        }
      }
    },

    watch : {
      source : {
        files : [
          'src/**/*.{js,es6}'
        ],
        tasks : ['build', 'copy']
      },

      livereload : {
        files : [
          'test/assets/**/*.*'
        ],
        options : {
          livereload : true
        }
      },

      express : {
        files : [
          'test/app-test.js'
        ],
        tasks : ['express', 'wait'],
        options : {
          livereload : true,
          nospawn : true
        }
      },

      // :: reload this grunt configuration when the gruntfile changes live
      gruntfile : {
        files : ['gruntfile.js'],
        tasks : []
      }
    }

  });

  grunt.registerTask('wait', function () {
    grunt.log.ok('Waiting for server reload.');

    var done = this.async();
    setTimeout(function () {
      grunt.log.writeln('Done waiting.');
      done();
    }, 1500);
  });

  grunt.registerTask('express-keepalive', function () {
    this.async();
  });

  grunt.registerTask('serve', ['build', 'express', 'wait', 'open:test', 'watch']);

  grunt.registerTask('build', ['jshint:source', 'browserify', 'uglify']);
  grunt.registerTask('test', ['build, copy']);

};