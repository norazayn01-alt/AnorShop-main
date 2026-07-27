let str = 'bitcoin take over the world maybe who knows perhaps'

function findTheLowestLength(string) {
  let splitStr = string.split(' ')

  let result = Math.min(
    ...splitStr.map((item) => {
      return item.length
    })
  )

  console.log(result)
}

findTheLowestLength(str)
