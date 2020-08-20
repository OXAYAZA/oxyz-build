const
	gulp = require( 'gulp' ),
	util = require( './util.js' );
	action = require( './action.js' );

/**
 * Создание массива функций из массива обьектов действий.
 * Результат в дальнейшем передаетсся в gulp.series или gulp.parallel.
 * @param {Array} setArr - массив обьектов действий
 * @return {Array} - массив вункций
 */
function set ( setArr ) {
	let execution = [];

	setArr.forEach( ( action ) => {
		if ( action instanceof Function ) {
			execution.push( action );
		} else if ( action instanceof Object ) {
			execution.push( action.execute );
		}
	});

	return execution;
}

/**
 * Создание gulp-таска из массива обьектов действий.
 * Должен быть экспортирован в gulpfile.js или передан в другой таск.
 * Является оберткой над gulp.series.
 * @param {Array} setArr - массива обьектов действий
 * @return {function} - функция возвращаемая gulp.series
 */
function task ( setArr ) {
	return gulp.series( set( setArr ) );
}

module.exports = { set, task, action, util };
