module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // watch: {
    //   sass: {
    //     files: 'src/stylesheets/*.scss',
    //     tasks: ['sass']
    //   },
    //   haml: {
    //     files: 'app/templates/*.haml',
    //     tasks: ['haml']
    //   }
    // },
    sass: {
      dist: {
        files: {
          'dist/css/main.css' : 'src/stylesheets/main.scss'
        }
      }
    },
    haml: {
      dist: {
        files: {
          'dist/index.html' : 'src/templates/main.haml'
        }
      }
    },
    concat: {
      generated: {
        files: [
          {
            dest: '.tmp/js/main.js',
            src: [
              'bower_components/jquery/dist/jquery.js',
              'bower_components/bootstrap/dist/js/bootstrap.js',
              'bower_components/underscore/underscore.js',
              'bower_components/backbone/backbone.js',
              'src/scripts/main.js'
            ]
          },
          {
            dest: '.tmp/css/main.css',
            src: [
            // TODO: Replace this with custom bootstrap.css
              'bower_components/bootstrap/dist/css/bootstrap.css',
              'src/stylesheets/main.css'
            ]
          }
        ]
      }
    },
    uglify: {
      generated: {
        files: [
          {
            dest: 'dist/js/main.js',
            src: ['.tmp/js/main.js']
          }
        ]
      }
    },
    // cssmin: {

    // },
    useminPrepare: {
      options: {
        dest: 'dist'
      },
      html: 'dist/index.html'
    },
    usemin: {
      options: {
        dirs: ['dist']
      },
      html: ['dist/{,*/}*.html'],
      css: ['dist/styles/{,*/}*.css']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-haml');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-usemin');

  grunt.registerTask('build', [
    'sass',
    'haml',
    'concat:generated',
    'uglify:generated',
    'cssmin:generated',
    'useminPrepare',
    'usemin'
    ]);
};
