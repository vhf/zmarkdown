module.exports = (config) => tree => {
  tree.type = config.type
  tree.data = { level: config.level - 1 }
}
