
# Zemez Build
Надстройка над Gulp для быстрой и простой сборки проекта.

## Использование
Простая пошаговая инструкция:
- Создайте в корневой папке проекта файл _gulpfile.js_.
- Импортируйте модуль _zemez-build_.
- Экспортируйте результат вызова функции `task` с нужными параметрами.
- Запустите файл из консоли (`gulp`)

Например:
```js
const { action, task } = require( 'zemez-build' );

module.exports.build = task([
	action.clean({ src: 'dist' }),
	action.copy({ src: [ 'dev/**/*.scss', 'dev/**/*.pug' ], dest: 'tmp' }),
	action.delMarker({ src: 'tmp/**/*', dest: 'tmp', marker: 'DIST' }),
	action.sass({ src: 'tmp/**/!(_)*.scss', dest: 'dist' }),
	action.pug({ src: 'tmp/components/page/!(_)*.pug', dest: 'dist' }),
	action.copy({ src: [ 'dev/**/*.js', 'dev/**/*.ico' ], dest: 'dist' }),
	action.minifyimg({ src: [ 'dev/**/*.jpg', 'dev/**/*.png' ], dest: 'dist' }),
	action.clean({ src: 'tmp' })
]);

```


## API

### set()
Создает из последовательности действий массив выполняемых функций для дальнейшей передачи в [gulp.series](https://gulpjs.com/docs/en/api/series) или [gulp.parallel](https://gulpjs.com/docs/en/api/parallel).

```js
executableSet = set( actions );
```

| параметр | тип | описание |
|:---:|:---:|---|
| `actions` | _Array_ | Массив набора действий |
| `executableSet` | _Array_ | Испольняемый набор функций |


### task()
Создает из последовательности действий gulp-таск.
В дальнейшем может быть вставлен в другой таск или экспортирован.

```js
series = task( actions );
```

| параметр | тип | описание |
|:---:|:---:|---|
| `actions` | _Array_ | Массив набора действий |
| `series` | _function_ | Серия тасков |


### action.custom()
Обертка для быстрого создания своего простого действия

```js
actionObject = action.custom( options );
```

| параметр | тип | описание |
|:---:|:---:|---|
| `actionObject` | _object_ | Созданный обьект действия для дальнейшего исполнения |
| `options` | _object_ | Параметры действия |
| `options.name` | _string_ | Отображаемое в консоли имя действия при выполнении |
| `options.cb` | _function_ | Выполняемый колбек (длжен быть синхронным), не принимает параметров |


### action.copy()
Копирование файлов

```js
actionObject = action.copy( options );
```

| параметр | тип | описание |
|:---:|:---:|---|
| `actionObject` | _object_ | Созданный обьект действия для дальнейшего исполнения |
| `options` | _object_ | Параметры действия |
| `options.name` | _string_ | Отображаемое в консоли имя действия при выполнении |
| `options.cb` | _function_ | Выполняемый колбек (длжен быть синхронным), не принимает параметров |
| `options.opts` | _object_ | [gulp.src параметры](https://gulpjs.com/docs/en/api/src) |
| `options.src` | _string\|Array_ | glob выборка файлов для копирования |
| `options.dest` | _string_ | путь назначения |


### action.clean()
Удаление файлов

```js
actionObject = action.clean( options );
```

| параметр | тип | описание |
|:---:|:---:|---|
| `actionObject` | _object_ | Созданный обьект действия для дальнейшего исполнения |
| `options` | _object_ | Параметры действия |
| `options.name` | _string_ | Отображаемое в консоли имя действия при выполнении |
| `options.cb` | _function_ | Выполняемый колбек (длжен быть синхронным), не принимает параметров |
| `options.src` | _string\|Array_ | glob выборка файлов для удаления |


### action.minifyimg()
Минификация картинок

```js
actionObject = action.minifyimg( options );
```

| параметр | тип | описание |
|:---:|:---:|---|
| `actionObject` | _object_ | Созданный обьект действия для дальнейшего исполнения |
| `options` | _object_ | Параметры действия |
| `options.name` | _string_ | Отображаемое в консоли имя действия при выполнении |
| `options.cb` | _function_ | Выполняемый колбек (длжен быть синхронным), не принимает параметров |
| `options.opts` | _object_ | [gulp.src параметры](https://gulpjs.com/docs/en/api/src) |
| `options.src` | _string\|Array_ | glob выборка файлов для минификации |
| `options.dest` | _string_ | путь назначения |


### action.delMarker()
Удаление части содержимого фалойв по маркерам

```js
actionObject = action.delMarker( options );
```

| параметр | тип | описание |
|:---:|:---:|---|
| `actionObject` | _object_ | Созданный обьект действия для дальнейшего исполнения |
| `options` | _object_ | Параметры действия |
| `options.name` | _string_ | Отображаемое в консоли имя действия при выполнении |
| `options.opts` | _object_ | [gulp.src параметры](https://gulpjs.com/docs/en/api/src) |
| `options.src` | _string\|Array_ | glob выборка файлов |
| `options.dest` | _string_ | путь назначения |
| `options.marker` | _string_ | Имя маркера (допустимы цифры, буквы верхнего регистра и символ подчеркивания) |


### action.pug()
Компиляция pug файлов

```js
actionObject = action.pug( options );
```

| параметр | тип | описание |
|:---:|:---:|---|
| `actionObject` | _object_ | Созданный обьект действия для дальнейшего исполнения |
| `options` | _object_ | Параметры действия |
| `options.name` | _string_ | Отображаемое в консоли имя действия при выполнении |
| `options.cb` | _function_ | Выполняемый колбек (длжен быть синхронным), не принимает параметров |
| `options.opts` | _object_ | [gulp.src параметры](https://gulpjs.com/docs/en/api/src) |
| `options.pug` | _object_ | параметры [pug компилятора](https://pugjs.org/api/reference.html) |
| `options.src` | _string\|Array_ | glob выборка файлов для компиляции |
| `options.dest` | _string_ | путь назначения |


### action.sass()
Компиляция sass файлов

```js
actionObject = action.sass( options );
```

| параметр | тип | описание |
|:---:|:---:|---|
| `actionObject` | _object_ | Созданный обьект действия для дальнейшего исполнения |
| `options` | _object_ | Параметры действия |
| `options.name` | _string_ | Отображаемое в консоли имя действия при выполнении |
| `options.cb` | _function_ | Выполняемый колбек (длжен быть синхронным), не принимает параметров |
| `options.opts` | _object_ | [gulp.src параметры](https://gulpjs.com/docs/en/api/src) |
| `options.sass` | _object_ | параметры [sass компилятора](https://github.com/sass/node-sass#options) |
| `options.src` | _string\|Array_ | glob выборка файлов для компиляции |
| `options.dest` | _string_ | путь назначения |


### action.transform()
Транформация содержимого файлов из выборки

```js
actionObject = action.transform( options );
```

| параметр | тип | описание |
|:---:|:---:|---|
| `actionObject` | _object_ | Созданный обьект действия для дальнейшего исполнения |
| `options` | _object_ | Параметры действия |
| `options.name` | _string_ | Отображаемое в консоли имя действия при выполнении |
| `options.opts` | _object_ | [gulp.src параметры](https://gulpjs.com/docs/en/api/src) |
| `options.src` | _string\|Array_ | glob выборка файлов для обработки |
| `options.dest` | _string_ | путь назначения |
| `options.cb` | _function_ | колбек для транформации, получает содержимое файла contents и file, должен возвращать строку |


### action.json()
Изменение содержимого json-файла как обьекта

```js
actionObject = action.json( options );
```

| параметр | тип | описание |
|:---:|:---:|---|
| `actionObject` | _object_ | Созданный обьект действия для дальнейшего исполнения |
| `options` | _object_ | Параметры действия |
| `options.name` | _string_ | Отображаемое в консоли имя действия при выполнении |
| `options.opts` | _object_ | [gulp.src параметры](https://gulpjs.com/docs/en/api/src) |
| `options.src` | _string\|Array_ | glob выборка файлов для обработки |
| `options.dest` | _string_ | путь назначения |
| `options.cb` | _function_ | колбек для транформации, получает обьект, должен возвращать обьект |
