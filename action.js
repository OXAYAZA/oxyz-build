const
	util     = require( './util.js' ),
	color    = require( 'ansi-colors' ),
	gulp     = require( 'gulp' ),
	del      = require( 'del' ),
	pug      = require( 'gulp-pug' ),
	sass     = require( 'gulp-sass' ),
	insert   = require( 'gulp-insert' ),
	cache    = require( 'gulp-cache' ),
	imagemin = require( 'gulp-imagemin' );

let action = {};


/**
 * Обертка для быстрого создания своего действия
 * @param {object} [data] - объект с параметрами
 * @param {string} [data.name] - отображаемое имя действия
 * @param {function} [data.cb] - выполняемый колбек (длжен быть синхронным)
 */
action.custom = function ( data ) {
	if ( !data ) data = {};

	data.execute = function ( end ) {
		if ( data.cb instanceof Function ) data.cb();
		end();
	};

	data.execute.displayName = data.name || 'custom';
	return data;
};

/**
 * Копирование файлов
 * @param {object} data - объект с параметрами
 * @param {string} [data.name] - отображаемое имя действия
 * @param {function} [data.cb] - выполняемый колбек (должен быть синхронным)
 * @param {object} [data.opts] - gulp.src параметры
 * @param {string|Array.<string>} data.src - glob выборка файлов для копирования
 * @param {string|Array.<string>} data.dest - путь назначения
 */
action.copy = function ( data ) {
	if ( !data || !data.src || !data.dest ) throw Error( 'Required parameter of action.copy not specified (src, dest)' );
	data.opts = util.merge( { allowEmpty: true }, data.opts );

	data.execute = function () {
		if ( data.cb instanceof Function ) data.cb();
		util.log( 'source:', color.magenta( data.src ) );
		let pipeline = gulp.src( data.src, data.opts );

		if ( data.dest instanceof Array ) {
			data.dest.forEach( ( str ) => {
				util.log( 'destination:', color.magenta( str ) );
				pipeline = pipeline.pipe( gulp.dest( str ) );
			});
		} else {
			util.log( 'destination:', color.magenta( data.dest ) );
			pipeline = pipeline.pipe( gulp.dest( data.dest ) );
		}

		return pipeline;
	};

	data.execute.displayName = data.name || 'Copy';
	return data;
};

/**
 * Удаление файлов
 * @param {object} data - объект с параметрами
 * @param {string} [data.name] - отображаемое имя действия
 * @param {function} [data.cb] - выполняемый колбек (должен быть синхронным)
 * @param {string|Array.<string>} data.src - glob выборка файлов для удаления
 */
action.clean = function ( data ) {
	if ( !data || !data.src ) throw Error( 'Required parameter of action.clean not specified (src)' );

	data.execute = function () {
		if ( data.cb instanceof Function ) data.cb();
		util.log( 'source:', color.magenta( data.src ) );
		return del( data.src );
	};

	data.execute.displayName = data.name || 'Clean';
	return data;
};

/**
 * Минификация картинок
 * @param {object} data - объект с параметрами
 * @param {string} [data.name] - отображаемое имя действия
 * @param {function} [data.cb] - выполняемый колбек (должен быть синхронным)
 * @param {object} [data.opts] - gulp.src параметры
 * @param {string|Array.<string>} data.src - glob выборка файлов для минификации
 * @param {string} [data.dest] - путь назначения, если не указан то будут перезаписанны исходные файлы
 * @param {boolean} [data.cache] - использование кеширования при минификации
 */
action.minifyimg = function ( data ) {
	if ( !data || !data.src ) throw Error( 'Required parameter of action.minifyimg not specified (src)' );

	data.execute = function () {
		if ( data.cb instanceof Function ) data.cb();
		util.log( 'source:', color.magenta( data.src ) );
		let pipeline = gulp.src( data.src, data.opts );

		if ( data.cache ) {
			util.log( color.yellow( 'cache is used!' ) );
			pipeline = pipeline.pipe( cache( imagemin([
				imagemin.gifsicle({ interlaced: true }),
				imagemin.mozjpeg({ progressive: true }),
				imagemin.optipng({ optimizationLevel: 5 })
			], { verbose: true }) ) );
		} else {
			pipeline = pipeline.pipe( imagemin([
				imagemin.gifsicle({ interlaced: true }),
				imagemin.mozjpeg({ progressive: true }),
				imagemin.optipng({ optimizationLevel: 5 })
			], { verbose: true }) );
		}

		if ( typeof( data.dest ) === 'string' ) {
			util.log( 'destination:', color.magenta( data.dest ) );
			pipeline = pipeline.pipe( gulp.dest( data.dest ) );
		} else if ( data.dest instanceof Array ) {
			data.dest.forEach( ( str ) => {
				util.log( 'destination:', color.magenta( str ) );
				pipeline = pipeline.pipe( gulp.dest( str ) );
			});
		} else {
			util.log( 'overwriting sources' );
			pipeline = pipeline.pipe( gulp.dest( ( file ) => {
				return file.base;
			}));
		}

		return pipeline;
	};

	data.execute.displayName = data.name || 'Minify Images';
	return data;
};

/**
 * Удаление части содержимого по маркерам
 * @param {object} data - объект с параметрами
 * @param {string} data.src - glob выборка файлов
 * @param {string} data.dest - конечный путь
 * @param {string} data.marker - имя маркера (допустимы цифры, буквы верхнего регистра и символ подчеркивания)
 * @param {object} [data.opts] - gulp.src параметры
 * @param {string} [data.name] - отображаемое имя задачи
 * @todo return
 * @todo если не задан dest, то использовать src
 * @todo парсинг маркера
 * @todo LET- маркер
 * @todo комментарий #
 */
action.delMarker = function ( data ) {
	if ( !data || !data.src || !data.dest || !data.marker ) throw Error( `Required parameter of action.delMarker not specified (src, dest, marker), get ${data.src}` );

	data.execute = function () {
		util.log( 'Delete markers:', color.magenta( data.src ), '>>', color.magenta( data.dest ) );
		return gulp.src( data.src, data.opts )
			.pipe( insert.transform( function( content, file ) {
				let regExp = new RegExp( `\\s*\\/\\/\\{DEL.*?${data.marker}.*?\\}[^\\v]*?\\/\\/\\{DEL\\}`, 'g' );
				return content.replace( regExp, function() {
					util.log( color.yellow( `DEL ${data.marker} at:` ), file.path );
					return '';
				}).replace( /\s*\/\/\{DEL.*?\}/g, '' );
			}))
			.pipe( gulp.dest( data.dest ) );
	};

	data.execute.displayName = data.name || `Delete markers ${data.marker}`;
	return data;
};

/**
 * Компиляция pug файлов
 * @param {object} data - объект с параметрами
 * @param {string} [data.name] - отображаемое имя действия
 * @param {function} [data.cb] - выполняемый колбек (должен быть синхронным)
 * @param {object} [data.opts] - gulp.src параметры
 * @param {object} [data.pug] - параметры pug компилятора
 * @param {string|Array} data.src - glob выборка файлов для компиляции
 * @param {string} data.dest - путь назначения
 */
action.pug = function ( data ) {
	if ( !data || !data.src || !data.dest ) throw Error( 'Required parameter of action.pug not specified (src, dest)' );

	data.execute = function () {
		if ( data.cb instanceof Function ) data.cb();
		util.log( 'Compile PUG:', color.magenta( data.src ), '>>', color.magenta( data.dest ) );
		return gulp.src( data.src, data.opts )
			.pipe( pug( data.pug ) )
			.pipe( gulp.dest( data.dest ) );
	};

	data.execute.displayName = data.name || 'Pug';
	return data;
};

/**
 * Компиляция sass файлов
 * @param {object} data - объект с параметрами
 * @param {string} [data.name] - отображаемое имя действия
 * @param {function} [data.cb] - выполняемый колбек (должен быть синхронным)
 * @param {object} [data.opts] - gulp.src параметры
 * @param {object} [data.sass] - параметры sass компилятора
 * @param {string|Array} data.src - glob выборка файлов для компиляции
 * @param {string} data.dest - путь назначения
 * @todo data.nobase from tempaw-functions
 */
action.sass = function ( data ) {
	if ( !data || !data.src || !data.dest ) throw Error( 'Required parameter of action.sass not specified (src, dest)' );

	data.execute = function () {
		if ( data.cb instanceof Function ) data.cb();
		util.log( 'Compile SASS:', color.magenta( data.src ), '>>', color.magenta( data.dest ) );
		return gulp.src( data.src, data.opts )
			.pipe( sass( data.sass ) )
			.pipe( gulp.dest( data.dest ) );
	};

	data.execute.displayName = data.name || 'Sass';
	return data;
};

/**
 * Транформация содержимого файлов из выборки
 * @param {object} data - объект с параметрами
 * @param {string} [data.name] - отображаемое имя действия
 * @param {object} [data.opts] - gulp.src параметры
 * @param {string|Array} data.src - glob выборка файлов для обработки
 * @param {string} data.dest - путь назначения
 * @param {function} data.cb - колбек для транформации, получает содержимое файла contents и file, должен возвращать строку
 * @todo optional & multiple dest
 */
action.transform = function ( data ) {
	if ( !data || !data.src || !data.dest || !data.cb ) throw Error( 'Required parameter of action.transform not specified (src, dest, cb)' );

	data.execute = function () {
		util.log( 'Transform:', color.magenta( data.src ), '>>', color.magenta( data.dest ) );
		return gulp.src( data.src, data.opts )
			.pipe( insert.transform( function( contents, file ) { return data.cb( contents, file ); }))
			.pipe( gulp.dest( data.dest ) );
	};

	data.execute.displayName = data.name || 'Transform';
	return data;
};

/**
 * Изменение содержимого json-файла как объекта
 * @param {object} data - объект с параметрами
 * @param {string} [data.name] - отображаемое имя действия
 * @param {object} [data.opts] - gulp.src параметры
 * @param {string|Array} data.src - glob выборка файлов для обработки
 * @param {string} data.dest - путь назначения
 * @param {function} data.cb - колбек для транформации, получает объект, должен возвращать объект
 * @todo optional & multiple dest
 */
action.json = function ( data ) {
	if ( !data || !data.src || !data.dest || !data.cb ) throw Error( 'Required parameter of action.json not specified (src, dest, cb)' );

	data.execute = function () {
		util.log( 'Json:', color.magenta( data.src ), '>>', color.magenta( data.dest ) );
		return gulp.src( data.src, data.opts )
			.pipe( insert.transform( function( contents, file ) { return JSON.stringify( data.cb( JSON.parse( contents ) ) ); }))
			.pipe( gulp.dest( data.dest ) );
	};

	data.execute.displayName = data.name || 'Json';
	return data;
};


module.exports = action;
