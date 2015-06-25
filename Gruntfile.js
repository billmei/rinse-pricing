module.exports = function(grunt) {
  grunt.initConfig({
    watch: {
      sass: {
        files: 'app/scss/*.scss',
        tasks: ['sass']
      },
      haml: {
        files: 'app/views/*.haml',
        tasks: ['haml']
      }
    },
    sass: {
      dist: {
        files: {
          'app/css/main.css' : 'app/scss/main.scss'
        }
      }
    },
    haml: {
      dist: {
        files: {
          'app/index.html' : 'app/templates/main.haml'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-haml');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
