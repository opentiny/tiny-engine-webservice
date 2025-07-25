/**
 * Copyright (c) 2023 - present TinyEngine Authors.
 * Copyright (c) 2023 - present Huawei Cloud Computing Technologies Co., Ltd.
 *
 * Use of this source code is governed by an MIT-style license.
 *
 * THE OPEN SOURCE SOFTWARE IN THIS PRODUCT IS DISTRIBUTED IN THE HOPE THAT IT WILL BE USEFUL,
 * BUT WITHOUT ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS FOR
 * A PARTICULAR PURPOSE. SEE THE APPLICABLE LICENSES FOR MORE DETAILS.
 *
 */
import colors from 'picocolors'

class Logger {
  constructor(command) {
    this.command = command
  }

  output(type, msg) {
    const format = () => {
      const colorMap = {
        info: 'cyan',
        warn: 'yellow',
        error: 'red',
        success: 'green'
      }
      const time = new Date().toLocaleTimeString()
      const colorMsg = colors[colorMap[type]](type)

      return `[${this.command}] [${colors.dim(time)}] ${colorMsg} ${msg}`
    }

    return console.log(format())
  }

  info(msg) {
    this.output('info', msg)
  }

  warn(msg) {
    this.output('warn', msg)
  }

  error(msg) {
    this.output('error', msg)
  }

  success(msg) {
    this.output('success', msg)
  }
}

export default Logger
