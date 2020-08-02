'use strict'

const eslint = require('gulp-eslint')
const gulp = require('gulp')
const less = require('gulp-less')
const log = require('fancy-log')
const path = require('path')
const sourcemaps = require('gulp-sourcemaps')
const ts = require('gulp-typescript')
const typedoc = require('gulp-typedoc')

gulp.task('readme', () => {
    log('Generating documentation...')
    return gulp.src(['src/**/*.ts']).pipe(
        typedoc({
            excludeExternals: true,
            ignoreCompilerErrors: false,
            includeDeclarations: true,
            name: 'cso2-inventory-service',
            out: './docs',
            plugins: ['mdFlavour github'],
            theme: 'markdown',
            tsconfig: 'tsconfig.json',
            version: true
        })
    )
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
    return project
        .src()
        .pipe(sourcemaps.init())
        .pipe(project())
        .pipe(
            sourcemaps.write('.', {
                includeContent: false,
                sourceRoot: '../src'
            })
        )
        .pipe(gulp.dest('dist'))
})

gulp.task('less', () => {
    log('Transpiling style sheets...')
    return gulp
        .src('src/less/*.less')
        .pipe(
            less({
                paths: [path.join('src/less/includes')]
            })
        )
        .pipe(gulp.dest('public/styles'))
})

gulp.task('build', gulp.series('less', 'eslint', 'typescript'))

gulp.task('typedoc', gulp.series('readme'))

gulp.task('default', gulp.series('less', 'typescript'))
