'use strict'

const eslint = require('gulp-eslint')
const gulp = require('gulp')
const log = require('fancy-log')
const ts = require('gulp-typescript')
const typedoc = require('gulp-typedoc')

gulp.task('readme', () => {
  log('Generating documentation...')
  return gulp.src(['src/**/*.ts'])
    .pipe(typedoc({
      excludeExternals: true,
      ignoreCompilerErrors: false,
      includeDeclarations: true,
      name: 'cso2-master-server',
      out: './docs',
      plugins: ['mdFlavour github'],
      theme: 'markdown',
      tsconfig: 'tsconfig.json',
      version: true
    }))
})

gulp.task('eslint', () => {
  log('Linting source code...')
  return gulp
    .src(['src/**/*.ts'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('typescript', () => {
  log('Transpiling source code...')
  const project = ts.createProject('tsconfig.json')
  return project.src().pipe(project()).pipe(gulp.dest('dist'))
})

gulp.task('build', gulp.series(
  'eslint',
  'typescript'
))

gulp.task('typedoc', gulp.series(
  'readme'
))

gulp.task('default', gulp.series(
  'typescript'
))