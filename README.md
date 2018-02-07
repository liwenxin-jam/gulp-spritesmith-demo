>人都是喜欢偷懒的，而偷懒也是进步的源泉。没有人喜欢做机械化的工作，都想着一键生成或搞掂。例如以前我们如果压缩图片一般会用tinypng在线压缩，而合并雪碧图需要用到PS来手动合成，本文是借助gulp实现图片压缩功能和合并雪碧图。

- 因为是基于gulp，肯定是需要安装gulp环境，至于是安装的全局环境还是局部依赖，就看个人喜好。
```js
//如果你之前有全局安装过一个版本的 gulp，请执行一下 npm rm --global gulp 来避免和 gulp-cli 冲突
npm install --global gulp-cli
//基于项目局部安装依赖，需要先基于npm init -y初始化
npm install --save-dev gulp
```

- 首先给大家介绍图片压缩功能，需要各位自行下载依赖，分别有gulp-imagemin、imagemin-pngcrush、gulp del、gulp-notify等等。在根目录创建一个gulpfile.js文件，文件内容如下：
```js
//npm install --D gulp del //安装依赖方式
var gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),//图片压缩
    pngcrush = require('imagemin-pngcrush'),
    del = require('del'),  //删除文件夹
    notify = require('gulp-notify');//提示信息

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

//删除文件及文件夹，在执行打包的时候，一般都需要先清理目标文件夹，以保证每次打包时，都是最新的文件。
gulp.task('clean', function (cb) {
  del([
    // 这里我们使用一个通配模式来匹配 `mobile` 文件夹中的所有东西
    'dist/**/*',
    // 我们不希望删掉这个文件，所以我们取反这个匹配模式
    '!dist/images/share-weixin.png'
  ], cb);
});

// 默认任务
gulp.task('default', function(){
  gulp.run('clean', 'img');

  //前者是监听路径，后者是task任务名称
  gulp.watch('images/*.png', ['img']);
});
```

- 调用测试
```js
gulp  //省略task名称，默认会去查找default任务
gulp clean
gulp img
gulp default  //有监听图片文件夹内容变化
```

- 图片合并雪碧图有两种方式，一种是用spritesmith插件，另外一种是gulp-css-spriter插件。注释1:Algorithm有四个可选值分别为top-down、left-right、diagonal、alt-diagonal、binary-tree。注释2cssTemplate是生成css的模板文件可以是字符串也可以是函数。如果是字符串则是对于相对的模板地址。
```js
var gulp = require('gulp'),
    spritesmith = require('gulp.spritesmith');
//spritesmith插件方式
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
```

- 在根目录css文件夹下新增spritesmithTemplateStr.css模板
```css
{{#sprites}}
.icon-{{name}}{
    background-image: url("{{escaped_image}}");
    background-position: {{px.offset_x}} {{px.offset_y}};
    width: {{px.width}};
    height: {{px.height}};
}
{{/sprites}}
```

- cssTemplate如果是函数式的方式
```js
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
```

- gulp-css-spriter插件跟gulp-css-spriter插件有点区别，它是允许保留你原来的样式，只是自动调整你原来的css代码里的图片地址。
```js
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

// 默认任务
gulp.task('default', function(){
  gulp.run('clean', 'img', 'spriter');

  // Watch image files， 前者是监听路径，后者是task任务名称
  gulp.watch('images/*.png', ['img', 'spriter']);
});
```

- 在根目录css文件夹下新增spriter.css样式，测试匹配上面gulp-css-spriter插件合并图需要修改的引入样式
```css
.icon-finished-Furniture-menu1 {
    display: none;
    background-image: url('../images/finished-Furniture-menu1.png');
}
.icon-finished-Furniture-menu1_active {
    color: red;
    background-image: url('../images/finished-Furniture-menu1_active.png');
}
.icon-finished-Furniture-menu2 {
    font-size: 20px;
    background-image: url('../images/finished-Furniture-menu2.png');
}
.icon-finished-Furniture-menu2_active {
    border: 1px solid #ccc;
    background-image: url('../images/finished-Furniture-menu2_active.png');
}
.icon-finished-Furniture-menu3 {
    display: block;
    background-image: url('../images/finished-Furniture-menu3.png');
}
.icon-finished-Furniture-menu3_active {
    float: left;
    background-image: url('../images/finished-Furniture-menu3_active.png');
}
```

- 调用测试
```js
gulp  //省略task名称，默认会去查找default任务
gulp clean
gulp spritesmith1
gulp spritesmith2
gulp spriter
gulp default  //有监听图片文件夹内容变化
```

- 参考文献
1、[gulp多张图片自动合成雪碧图](https://www.cnblogs.com/qianlitiaotiao/p/5054231.html)
2、[把所有的小图标一起做成雪碧图吧 请用gulp-css-spriter](https://www.cnblogs.com/alone2015/p/5328079.html)