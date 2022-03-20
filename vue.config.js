// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
        .tap(options => {
          // modify the options...
          return options
        })
      .end()
      .use('@vusion/md-vue-loader')
      .loader('@vusion/md-vue-loader')
      .end();
}
}