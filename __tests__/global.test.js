const normalizeCount = count => {
    if (typeof count === "string")
        return count.replace(/\B(?=(\d{3})+(?!\d))/g, " ")

    if (typeof count === "number" && !isNaN(count))
        return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")

    if (isNaN(count)) return 0

    return "Unknown"
}

describe("Normalize count", () => {
    test("it should return number with spaces", () => {
        expect(normalizeCount(10000)).toEqual("10 000")
        expect(normalizeCount("100")).toEqual("100")
        expect(normalizeCount("1000000")).toEqual("1 000 000")
        expect(normalizeCount(21543273)).toEqual("21 543 273")
    })
})

const convertSecondsToDuration = lengthSeconds => {
    if (typeof lengthSeconds === "string" && lengthSeconds.includes(":"))
        return lengthSeconds

    let seconds = +lengthSeconds
    let minutes = Math.floor(seconds / 60)
    let hours = ""

    if (minutes > 59) {
        hours = Math.floor(minutes / 60)
        hours = hours >= 10 ? hours : `0${hours}`
        minutes = minutes - hours * 60
        minutes = minutes >= 10 ? minutes : `0${minutes}`
    }

    seconds = Math.floor(seconds % 60)
    seconds = seconds >= 10 ? seconds : `0${seconds}`

    if (hours !== "") return `${hours}:${minutes}:${seconds}`

    return `${minutes}:${seconds}`
}

describe("Convert seconds to duration", () => {
    test("it should return normal video duration like YT", () => {
        expect(convertSecondsToDuration(60)).toEqual("1:00")
        expect(convertSecondsToDuration("123")).toEqual("2:03")
        expect(convertSecondsToDuration("3601")).toEqual("01:00:01")
        expect(convertSecondsToDuration(1265)).toEqual("21:05")
        expect(convertSecondsToDuration("02:13:19")).toEqual("02:13:19")
    })
})

const convertDurationToSeconds = duration => {
    if (!duration.includes(":")) return

    if (duration.length === 5 || duration.length === 4) {
        const [minutes, seconds] = duration.split(":")
        return Number(minutes) * 60 + Number(seconds)
    } else if (duration.length === 8 || duration.length === 7) {
        const [hours, minutes, seconds] = duration.split(":")
        return Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds)
    }
}

describe("Convert duration to seconds", () => {
    test("it should return seconds", () => {
        expect(convertDurationToSeconds("1:00")).toEqual(60)
        expect(convertDurationToSeconds("2:03")).toEqual(123)
        expect(convertDurationToSeconds("01:00:01")).toEqual(3601)
        expect(convertDurationToSeconds("21:05")).toEqual(1265)
    })
})

const isEmpty = el =>
    el === null ||
    el === undefined ||
    el === "" ||
    el === "undefined" ||
    el === "null"

describe("Is empty?", () => {
    test("check if el is empty", () => {
        expect(isEmpty(null)).toEqual(true)
        expect(isEmpty("")).toEqual(true)
        expect(isEmpty(12)).toEqual(false)
        expect(isEmpty("empty")).toEqual(false)
    })
})

const formatDuration = str => str.replace(new RegExp(/[^0-9:]/gim), "")

describe("Format duration", () => {
    test("delete each char but 0-9 and ':", () => {
        expect(formatDuration("12:t.32")).toEqual("12:32")
        expect(formatDuration("1:00")).toEqual("1:00")
        expect(formatDuration("r/Y1:12u")).toEqual("1:12")
    })
})

const formatDate = str => str.split("-").reverse().join(".")

describe("Format date", () => {
    test("reverse default date and replace ':' with '-'", () => {
        expect(formatDate("2021-05-01")).toEqual("01.05.2021")
        expect(formatDate("2010-01-21")).toEqual("21.01.2010")
        expect(formatDate("2015-12-30")).toEqual("30.12.2015")
    })
})

const formatIP = str => str.replace(new RegExp(/[^0-9.]/gim), "")

describe("Format IP", () => {
    test("delete each char but 0-9 and '.'", () => {
        expect(formatIP("12:t.32")).toEqual("12.32")
        expect(formatIP("127.0.0.1")).toEqual("127.0.0.1")
        expect(formatIP("r/Y1:12u")).toEqual("112")
    })
})

const convertToPercentage = (firstNum, secondNum) =>
    (firstNum * 100) / secondNum

describe("Convert to percentage", () => {
    test("convert to percentage using 2 args", () => {
        expect(convertToPercentage(10, 100)).toEqual(10)
        expect(convertToPercentage(2, 50)).toEqual(4)
    })
})

const isValidURLYT = url => {
    const regExp = /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.?be)\/.+$/
    return url.match(regExp) && url.match(regExp).length > 0
}

describe("Is valid YT URL?", () => {
    test("check if string is yt url", () => {
        expect(isValidURLYT("youtube.com/bla")).toBe(true)
        expect(isValidURLYT("https://youtube.com/?watch=v")).toBe(true)
        expect(isValidURLYT("youtube.cm/?watch=v")).toBe(null)
    })
})

const isResourceIsChannel = url =>
    isValidURLYT(url) &&
    (url.includes("/user/") || url.includes("/channel/") || url.includes("/c/"))

describe("Is Channel YT URL", () => {
    test("check if string is yt url referring to channel", () => {
        expect(isResourceIsChannel("https://youtube.com/channel/")).toBe(
            true
        )
        expect(isResourceIsChannel("https://youtube.com/c/")).toBe(true)
    })
})

const isResourceIsPlaylist = url =>
    isValidURLYT(url) && url.includes("playlist?list=")

describe("Is Channel YT URL", () => {
    test("check if string is yt url referring to playlist", () => {
        expect(isResourceIsPlaylist("youtube.com/playlist?list=")).toBe(true)
        expect(isResourceIsPlaylist("http://youtu.be/playlist?list=")).toBe(true)
    })
})

const getChannelIdOrUser = url => {
    const regExpUser = /(channel|user|c)\/([a-zA-Z0-9\-_]*.)/.exec(url)

    if (regExpUser)
        return regExpUser[2].endsWith("/")
            ? regExpUser[2].substring(0, regExpUser[2].length - 1)
            : regExpUser[2]

    return null
}

describe("Get id of yt channel", () => {
    test("it should return id of yt channel from given url", () => {
        expect(getChannelIdOrUser("youtube.com/channel/15")).toEqual("15")
        expect(getChannelIdOrUser("youtube.com/user/Blender")).toEqual(
            "Blender"
        )
        expect(getChannelIdOrUser("http://youtube.com/c/123")).toEqual("123")
    })
})

const getPlaylistId = url => {
    const regExp = new RegExp("[&?]list=([a-z0-9_]+)", "i")
    const match = regExp.exec(url)

    if (match && match[1].length > 0) return match[1]

    return null
}

describe("Get id of yt playlist", () => {
    test("it should return id of yt playlist from given url", () => {
        expect(getPlaylistId("youtube.com/playlist?list=15")).toEqual("15")
        expect(getPlaylistId("youtube.com/playlist?list=123")).toEqual("123")
    })
})

const getMin = (a, b) => (a > b ? b : a)

describe("Get min of both", () => {
    test("", () => {
        expect(getMin(2, 10)).toEqual(2)
        expect(getMin(100, 10)).toEqual(10)
    })
})
