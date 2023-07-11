const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === "production" ? "/REPO_NAME/" : "/", // from https://learnvue.co/articles/deploy-vue-to-github-pages
  transpileDependencies: true
})


