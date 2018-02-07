var gulp = require('gulp'),
	spriter = require('gulp-css-spriter'),
	imagemin = require('gulp-imagemin'),//图片压缩
	pngcrush = require('imagemin-pngcrush'),
	del = require('del'),
	notify = require('gulp-notify'), //提示信息
	spritesmith = require('gulp.spritesmith');

gulp.task('spritesmith1', function(){
	return gulp.src('images/*.png') //需要合并的图片地址
		.pipe(spritesmith({
			imgName: 'images/sprite.png', //保存合并后图片的地址
            cssName: 'css/sprite.css', //保存合并后对于css样式的地址
            padding:5, //合并时两个图片的间距
            algorithm: 'binary-tree', //注释1
            cssTemplate:"css/spritesmithTemplateStr.css" //注释2
		}))
		.pipe(gulp.dest('dist/'));
});

gulp.task('spritesmith2', function () {
    return gulp.src('images/*.png') //需要合并的图片地址
        .pipe(spritesmith({
            imgName: 'images/sprite.png', //保存合并后图片的地址
            cssName: 'css/sprite.css', //保存合并后对于css样式的地址
            padding:5, //合并时两个图片的间距
            algorithm: 'binary-tree', 
            cssTemplate: function (data) {
                var arr=[];
                data.sprites.forEach(function (sprite) {
                    arr.push(".icon-"+sprite.name+
                    "{" +
                    "background-image: url('"+sprite.escaped_image+"');"+
                    "background-position: "+sprite.px.offset_x+" "+sprite.px.offset_y+";"+
                    "width:"+sprite.px.width+";"+
                    "height:"+sprite.px.height+";"+
                    "}\n");
                });
                return arr.join("");
            }
        }))
        .pipe(gulp.dest('dist/'));
});

// 压缩图片
gulp.task('img', function() {
  return gulp.src('images/*')
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngcrush()]
    }))
    .pipe(gulp.dest('./dist/images/'))
    .pipe(notify({ message: 'img task ok' }));
}); 

 
gulp.task('spriter', function() {
    return gulp.src('./css/spriter.css')//spriter.css这个样式里面什么都不用改，是你想要合并的图就要引用这个样式。 很重要。
        .pipe(spriter({
            // The path and file name of where we will save the sprite sheet
            'spriteSheet': './dist/images/spritesheet.png', //这是雪碧图自动合成的图。 很重要
            // Because we don't know where you will end up saving the CSS file at this point in the pipe,
            // we need a litle help identifying where it will be.
            'pathToSpriteSheetFromCSS': '../images/spritesheet.png' //这是在css引用的图片路径，很重要
        }))
        .pipe(gulp.dest('./dist/css')); //最后生成出来
}); 

gulp.task('clean', function (cb) {
  del([
    // 这里我们使用一个通配模式来匹配 `mobile` 文件夹中的所有东西
    'dist/**/*',
    // 我们不希望删掉这个文件，所以我们取反这个匹配模式
    '!dist/images/share-weixin.png'
  ], cb);
});

// gulp.task('default', ['clean']);

// 默认任务
gulp.task('default', function(){
  gulp.run('clean', 'img', 'spriter');

  // Watch image files， 前者是监听路径，后者是task任务名称
  gulp.watch('images/*.png', ['img', 'spriter']);
});

