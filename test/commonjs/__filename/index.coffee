

# > typeof __filename
# 'string'

path = require 'path'

# > path.isAbsolute __filename
# true

# > path.relative process.cwd(), __filename
# 'test/commonjs/__filename/index.coffee'
