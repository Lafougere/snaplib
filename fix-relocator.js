var fs = require('fs');

var data = fs.readFileSync('./node_modules/@marshallofsound/webpack-asset-relocator-loader/dist/index.js').toString().split("\n");
data.splice(14688, 0, "assetState.assetSymlinks = assetState.assetSymlinks || {}");
data.splice(37675, 0, "assetState.assetSymlinks = assetState.assetSymlinks || {}");
var text = data.join("\n");

fs.writeFile('./node_modules/@marshallofsound/webpack-asset-relocator-loader/dist/index.js', text, function (err) {
  if (err) return console.log(err);
});