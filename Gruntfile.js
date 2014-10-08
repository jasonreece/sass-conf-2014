module.exports = function(grunt) {
  grunt.initConfig({
    watch: {
      livereload: {
        options: {
          livereload: true
        },
        files: ['index.html', 'slides/{,*/}*.{md,html}', 'js/*.js', 'css/*.css', 'stylesheets/**/*.scss']
      },
      index: {
        files: ['templates/_index.html', 'templates/_section.html', 'slides/list.json'],
        tasks: ['buildIndex']
      },
      coffeelint: {
        files: ['Gruntfile.coffee'],
        tasks: ['coffeelint']
      },
      jshint: {
        files: ['js/*.js'],
        tasks: ['jshint']
      },
      sass: {
        files: ['stylesheets/**/*.scss'],
        tasks: ['sass']
      }
    },
    sass: {
      options: {
        style: 'compressed'
      },
      theme: {
        files: {
          'bower_components/reveal.js/css/reveal.min.css': 'bower_components/reveal.js/css/reveal.css',
          'stylesheets/application.min.css': 'stylesheets/**/*.scss'
        }
      }
    },
    connect: {
      livereload: {
        options: {
          port: 9000,
          hostname: 'localhost',
          base: '.',
          open: true,
          livereload: true
        }
      }
    },
    coffeelint: {
      options: {
        indentation: {
          value: 4
        },
        max_line_length: {
          level: 'ignore'
        }
      },
      all: ['Gruntfile.coffee']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['js/*.js']
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            src: ['slides/**', 'bower_components/**', 'js/**', 'css/*.css', 'stylesheets/application.min.css'],
            dest: 'dist/'
          }, {
            expand: true,
            src: ['index.html'],
            dest: 'dist/',
            filter: 'isFile'
          }
        ]
      }
    },
    buildcontrol: {
      options: {
        dir: 'dist',
        commit: true,
        push: true,
        message: 'Built from %sourceCommit% on branch %sourceBranch%'
      },
      pages: {
        options: {
          remote: 'git@github.com:jasonreece/sass-conf-2014.git',
          branch: 'gh-pages'
        }
      }
    }
  });
  require('load-grunt-tasks')(grunt);
  grunt.registerTask('buildIndex', 'Build index.html from templates/_index.html and slides/list.json.', function() {
    var html, indexTemplate, sectionTemplate, slides;
    indexTemplate = grunt.file.read('templates/_index.html');
    sectionTemplate = grunt.file.read('templates/_section.html');
    slides = grunt.file.readJSON('slides/list.json');
    html = grunt.template.process(indexTemplate, {
      data: {
        slides: slides,
        section: function(slide) {
          return grunt.template.process(sectionTemplate, {
            data: {
              slide: slide
            }
          });
        }
      }
    });
    return grunt.file.write('index.html', html);
  });
  grunt.registerTask('test', '*Lint* javascript and coffee files.', ['coffeelint', 'jshint']);
  grunt.registerTask('serve', 'Run presentation locally and start watch process (living document).', ['buildIndex', 'sass', 'connect:livereload', 'watch']);
  grunt.registerTask('server', function() {
    grunt.log.warn;
    'The `server` task has been deprecated.\
         Use `grunt serve` to start a server.';
    return grunt.task.run(['serve']);
  });
  grunt.registerTask('dist', 'Save presentation files to *dist* directory.', ['test', 'sass', 'buildIndex', 'copy']);
  grunt.registerTask('deploy', 'Deploy to Github Pages', ['dist', 'buildcontrol']);
  return grunt.registerTask('default', ['test', 'server']);
};
