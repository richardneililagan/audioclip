'use strict';

module.exports = function (grunt) {

  // :: lazy load grunt components
  require ('jit-grunt')(grunt, {
    // TODO aliases
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
          transform : ['babelify']
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
        path : 'test/index.html'
      }
    },

    watch : {
      source : {
        files : [
          'src/**/*.{js,es6}'
        ],
        tasks : ['build', 'copy']
      },

      // :: reload this grunt configuration when the gruntfile changes live
      gruntfile : {
        files : ['gruntfile.js'],
        tasks : []
      }
    }

  });

  grunt.registerTask('serve', ['build', 'open:test', 'watch']);

  grunt.registerTask('build', ['jshint:source', 'browserify', 'uglify']);
  grunt.registerTask('test', ['build, copy']);

};