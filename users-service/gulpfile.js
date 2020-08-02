const eslint = require('gulp-eslint')
const gulp = require('gulp')
const log = require('fancy-log')
const sourcemaps = require('gulp-sourcemaps')
const mocha = require('gulp-mocha')
const ts = require('gulp-typescript')
const typedoc = require('gulp-typedoc')

gulp.task('readme', () => {
    log('Generating documentation...')
    return gulp.src(['src/**/*.ts']).pipe(
        typedoc({
            excludeExternals: true,
            ignoreCompilerErrors: false,
            includeDeclarations: true,
            name: 'cso2-users-service',
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

gulp.task('build', gulp.series('eslint', 'typescript'))

gulp.task('test', () => {
    log('Testing code...')
    return gulp.src('test/**/*.ts').pipe(
        mocha({
            require: 'ts-node/register'
        })
    )
})

gulp.task('default', gulp.series('typescript'))
