module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Watch for changes in development environment
    watch: {
      sass: {
        files: 'src/stylesheets/*.scss',
        tasks: ['sass']
      },
      haml: {
        files: 'src/templates/*.haml',
        tasks: ['haml']
      },
      js: {
        files: 'src/scripts/*.js',
        tasks: ['copy:scripts']
      },
    },
    // Compile SASS to CSS
    sass: {
      main: {
        files: [
          {
            'dev/css/main.css' : 'src/stylesheets/main.scss'
          },
          {
            'dev/css/imports.css' : 'src/stylesheets/imports.scss'
          }
        ]
      }
    },
    // Compile HAML to HTML
    haml: {
      main: {
        files: {
          'dev/index.html' : 'src/templates/main.haml'
        }
      }
    },
    copy: {
      // Copy library files into dev environment
      lib: {
        files: [
          /****JAVASCRIPT****/
          {src: ['bower_components/jquery/dist/jquery.js'], dest: 'dev/js/jquery.js'},
          {src: ['bower_components/bootstrap/dist/js/bootstrap.js'], dest: 'dev/js/bootstrap.js'},
          {src: ['bower_components/underscore/underscore.js'], dest: 'dev/js/underscore.js'},
          {src: ['bower_components/backbone/backbone.js'], dest: 'dev/js/backbone.js'},
          {src: ['bower_components/backbone.localstorage/backbone.localStorage.js'], dest: 'dev/js/backbone-localStorage.js'},
          {src: ['bower_components/chosen/chosen.jquery.min.js'], dest: 'dev/js/chosen.min.js'},
          /****CSS****/
          // TODO: Replace this with custom bootstrap.css
          {src: ['bower_components/bootstrap/dist/css/bootstrap.css'], dest: 'dev/css/bootstrap.css'},
          {src: ['bower_components/font-awesome/css/font-awesome.css'], dest: 'dev/css/font-awesome.css'},
          {src: ['bower_components/chosen/chosen.min.css'], dest: 'dev/css/chosen.min.css'},
        ]
      },
      // Copy src JavaScript into dev environment
      scripts: {
        files: [
          {
            src: ['src/scripts/main.js'],
            dest: 'dev/js/main.js'
          }
        ]
      },
      // Copy fonts and images into dev environment
      staticdev: {
        files: [
          {
            expand: true,
            flatten: true,
            src: [
              'bower_components/bootstrap/dist/fonts/*',
              'bower_components/font-awesome/fonts/*'
            ],
            dest: 'dev/fonts/'
          },
          {
            expand: true,
            flatten: true,
            src: [
              'bower_components/chosen/*.png'
            ],
            dest: 'dev/css/'
          },
          {
            expand: true,
            flatten: true,
            src: [
              'src/images/*'
            ],
            dest: 'dev/img/'
          }
        ]
      },
      // Copy fonts and images into production environment
      staticdist: {
        files: [
          {
            expand: true,
            flatten: true,
            src: [
              'bower_components/bootstrap/dist/fonts/*',
              'bower_components/font-awesome/fonts/*'
            ],
            dest: 'dist/fonts/'
          },
          {
            expand: true,
            flatten: true,
            src: [
              'bower_components/chosen/*.png'
            ],
            dest: 'dist/css/'
          },
          {
            expand: true,
            flatten: true,
            src: [
              'src/images/*'
            ],
            dest: 'dist/img/'
          }
        ]
      },
      // Copy html output into production environment
      views: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['dev/*.html'],
            dest: 'dist/'
          }
        ]
      }
    },
    // Concatenate JS and CSS into one file
    concat: {
      main: {
        files: [
          {
            src: [
              'dev/js/jquery.js',
              'dev/js/bootstrap.js',
              'dev/js/underscore.js',
              'dev/js/backbone.js',
              'dev/js/backbone-localStorage.js',
              'dev/js/chosen.min.js',
              'dev/js/main.js',
            ],
            dest: 'dev/js/packed.js'
          },
          {
            src: [
              'dev/css/imports.css',
              'dev/css/bootstrap.css',
              'dev/css/font-awesome.css',
              'dev/css/chosen.min.css',
              'dev/css/main.css',
            ],
            dest: 'dev/css/packed.css'
          }
        ]
      }
    },
    // Minify JS for production
    uglify: {
      main: {
        files: [
          {
            dest: 'dist/js/main.js',
            src: ['dev/js/packed.js']
          }
        ]
      }
    },
    // Minify CSS for production
    cssmin: {
      main: {
        files: [
          {
            dest: 'dist/css/main.css',
            src: ['dev/css/packed.css']
          }
        ],
        options: {
          processImport: true
        }
      }
    },
    // Configure minification target for production
    useminPrepare: {
      options: {
        dest: 'dist'
      },
      html: 'dist/index.html'
    },
    // Replace <link> href's and <script> src's with minified version
    usemin: {
      options: {
        dirs: ['dist']
      },
      html: ['dist/{,*/}*.html'],
      css: ['dist/css/{,*/}*.css']
    },
    // Serve files locally
    'http-server': {
      dev: {
        root: 'dev/',
        port: '5000',
        host: '127.0.0.1',
        runInBackground: true,
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-haml');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-http-server');

  // Initialize the dev environment
  grunt.registerTask('dev', [
    'sass',
    'haml',
    'copy:staticdev',
    'copy:lib',
    'copy:scripts'
    ]);

  // Watch the development environment for changes
  // and spin up a local server to serve files
  grunt.registerTask('run', [
    'http-server:dev',
    'watch'
    ]);

  // Compiles and minifies code for production
  grunt.registerTask('ship', [
    'dev',
    'copy:staticdist',
    'copy:views',
    'concat',
    'uglify',
    'cssmin',
    'useminPrepare',
    'usemin'
    ]);
};
