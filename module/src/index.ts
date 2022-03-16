const inputSchema = require('./utils/validate')

const MMR: { [key: string]: number } = Object.freeze({
  iron4: 200,
  iron3: 400,
  iron: 600,
  iron2: 800,
  iron1: 1000,
  bronze4: 1100,
  bronze3: 1150,
  bronze: 1200,
  bronze2: 1250,
  bronze1: 1300,
  silver4: 1400,
  silver3: 1450,
  silver: 1500,
  silver2: 1550,
  silver1: 1600,
  gold4: 1700,
  gold3: 1750,
  gold: 1800,
  gold2: 1850,
  gold1: 1900,
  platinum4: 2000,
  platinum3: 2050,
  platinum: 2100,
  platinum2: 2150,
  platinum1: 2200,
  diamond4: 2300,
  diamond3: 2350,
  diamond: 2400,
  diamond2: 2450,
  diamond1: 2500,
  master: 2750,
  grandmaster: 3000,
  challenger: 3250,
})

const ROLES_BY_INDEX = Object.freeze(['top', 'jug', 'mid', 'bot', 'sup'])

const quantile = (arr: Array<any>, q: number): number => {
  const sorted = arr.sort((a, b) => a - b)
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base])
  } else {
    return sorted[base]
  }
}

const permutation = (array: Array<any>): Array<Array<any>> => {
  function p(array: Array<any>, temp: Array<any>) {
    var i, x
    if (!array.length) {
      result.push(temp)
    }
    for (i = 0; i < array.length; i++) {
      x = array.splice(i, 1)[0]
      p(array, temp.concat(x))
      array.splice(i, 0, x)
    }
  }

  var result: Array<any> = []
  p(array, [])
  return result
}

function getUniqueTeams(set: Array<any>, k: number): Array<any> {
  let i, j, combs, head, tailcombs
  const temp = [...set]
  if (k == 1) {
    combs = []
    for (i = 0; i < set.length; i++) {
      combs.push([set[i]])
    }
    return combs
  }
  combs = []
  while (temp.length > k + 1) {
    head = temp.slice(0, 1)
    tailcombs = getUniqueTeams(temp.slice(1), k - 1)
    for (j = 0; j < tailcombs.length; j++) {
      combs.push(head.concat(tailcombs[j]))
    }
    temp.shift()
  }
  return combs
}

const getRoleStatusArray = (
  team: Array<number>,
  players: Array<{ name: string; elo: string; roles: string[] }>
) => {
  return team.map((player, i) => {
    let role = ROLES_BY_INDEX[i]
    let status = 'autofill'
    if (players[player].roles.length === 0) status = 'fill'
    if (players[player].roles[0] === role) status = 'primary'
    if (players[player].roles[1] && players[player].roles[1] === role)
      status = 'secondary'
    return status
  })
}

const prettyRank = (elo: string) => {
  const ranks: { [key: number]: string } = {
    1: 'i',
    2: 'ii',
    3: 'iii',
    4: 'iv',
  }
  const division = elo.match(/\d+$/)
  if (division) {
    return `${elo.charAt(0).toUpperCase() + elo.slice(1, -1)} ${ranks[
      Number(division[0])
    ].toUpperCase()}`
  } else {
    return elo.charAt(0).toUpperCase() + elo.slice(1)
  }
}

const getLaneDelta = (
  team1: Array<number>,
  team2: Array<number>,
  players: Array<{ name: string; elo: string; roles: string[] }>
): number => {
  let deltas = []
  for (let i = 0; i < 5; i++) {
    deltas.push(
      Math.abs(MMR[players[team1[i]].elo] - MMR[players[team2[i]].elo])
    )
  }
  return deltas.reduce((a, b) => a + b)
}

const prettyOutput = (
  lobbyData: {
    roleScore: number
    team1: {
      players: number[]
      roleScore: number
      mmr: number
    }
    team2: {
      players: number[]
      roleScore: number
      mmr: number
    }
    combo: any[]
    mmrDelta: number
  },
  players: Array<{ name: string; elo: string; roles: string[] }>
) => {
  const team1RoleBreakdown = getRoleStatusArray(
    lobbyData.team1.players,
    players
  )
  const team2RoleBreakdown = getRoleStatusArray(
    lobbyData.team2.players,
    players
  )
  const teamA = {
    roster: {
      top: {
        ...players[lobbyData.team1.players[0]],
        autofill: team1RoleBreakdown[0] === 'autofill',
        mmr: MMR[players[lobbyData.team1.players[0]].elo],
        elo: prettyRank(players[lobbyData.team1.players[0]].elo),
      },
      jug: {
        ...players[lobbyData.team1.players[1]],
        autofill: team1RoleBreakdown[1] === 'autofill',
        mmr: MMR[players[lobbyData.team1.players[1]].elo],
        elo: prettyRank(players[lobbyData.team1.players[1]].elo),
      },
      mid: {
        ...players[lobbyData.team1.players[2]],
        autofill: team1RoleBreakdown[2] === 'autofill',
        mmr: MMR[players[lobbyData.team1.players[2]].elo],
        elo: prettyRank(players[lobbyData.team1.players[2]].elo),
      },
      bot: {
        ...players[lobbyData.team1.players[3]],
        autofill: team1RoleBreakdown[3] === 'autofill',
        mmr: MMR[players[lobbyData.team1.players[3]].elo],
        elo: prettyRank(players[lobbyData.team1.players[3]].elo),
      },
      sup: {
        ...players[lobbyData.team1.players[4]],
        autofill: team1RoleBreakdown[4] === 'autofill',
        mmr: MMR[players[lobbyData.team1.players[4]].elo],
        elo: prettyRank(players[lobbyData.team1.players[4]].elo),
      },
    },
    mmr: lobbyData.team1.mmr,
    roleScore: lobbyData.team2.roleScore,
  }
  const teamB = {
    roster: {
      top: {
        ...players[lobbyData.team2.players[0]],
        autofill: team2RoleBreakdown[0] === 'autofill',
        mmr: MMR[players[lobbyData.team2.players[0]].elo],
        elo: prettyRank(players[lobbyData.team2.players[0]].elo),
      },
      jug: {
        ...players[lobbyData.team2.players[1]],
        autofill: team2RoleBreakdown[1] === 'autofill',
        mmr: MMR[players[lobbyData.team2.players[1]].elo],
        elo: prettyRank(players[lobbyData.team2.players[1]].elo),
      },
      mid: {
        ...players[lobbyData.team2.players[2]],
        autofill: team2RoleBreakdown[2] === 'autofill',
        mmr: MMR[players[lobbyData.team2.players[2]].elo],
        elo: prettyRank(players[lobbyData.team2.players[2]].elo),
      },
      bot: {
        ...players[lobbyData.team2.players[3]],
        autofill: team2RoleBreakdown[3] === 'autofill',
        mmr: MMR[players[lobbyData.team2.players[3]].elo],
        elo: prettyRank(players[lobbyData.team2.players[3]].elo),
      },
      sup: {
        ...players[lobbyData.team2.players[4]],
        autofill: team2RoleBreakdown[4] === 'autofill',
        mmr: MMR[players[lobbyData.team2.players[4]].elo],
        elo: prettyRank(players[lobbyData.team2.players[4]].elo),
      },
    },
    mmr: lobbyData.team2.mmr,
    roleScore: lobbyData.team2.roleScore,
  }
  const red = teamA.mmr > teamB.mmr ? teamA : teamB
  const blue = teamA.mmr > teamB.mmr ? teamB : teamA
  return {
    red,
    blue,
    metadata: {
      roleScore: lobbyData.roleScore,
      delta: lobbyData.mmrDelta,
      laneDelta: getLaneDelta(
        lobbyData.team1.players,
        lobbyData.team2.players,
        players
      ),
      skillLevel: teamA.mmr + teamB.mmr,
    },
  }
}

const getTeamOrder = (
  team: Array<number>,
  players: Array<{ name: string; elo: string; roles: string[] }>
): { order: Array<number>; roleScore: number } => {
  const perm = permutation(team)
  const results = perm.map((x) => {
    const rolesBreakdown = getRoleStatusArray(x, players)
    const roleScore = rolesBreakdown
      .map((x) => {
        if (x === 'primary') return 2
        if (x === 'secondary') return 1
        else return 0
      })
      .reduce((a, b) => a + b, 0)
    return {
      order: x,
      roleScore,
    }
  })
  const sorted = results.sort((a, b) => b.roleScore - a.roleScore)
  return sorted[0]
}

const getTeamMMR = (
  team: Array<number>,
  players: Array<{ name: string; elo: string; roles: string[] }>
): number => {
  let x = 0
  team.map((i) => (x += MMR[players[i].elo]))
  return x
}

function matchmaking(
  input: Array<{ name: string; elo: string; roles: string[] }>
) {
  const fixedIndexArray: Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const lobbies = getUniqueTeams(fixedIndexArray, 5)

  const games = lobbies
    .map((l) => {
      const players = Array.from(new Set([...l, ...fixedIndexArray]))
      const team1 = players.slice(0, 5)
      const team1mmr = getTeamMMR(team1, input)
      const team2 = players.slice(5, 10)
      const team2mmr = getTeamMMR(team2, input)
      return {
        combo: players,
        mmrDelta: Math.abs(team1mmr - team2mmr),
        team1: {
          players: team1,
          mmr: team1mmr,
        },
        team2: {
          players: team2,
          mmr: team2mmr,
        },
      }
    })
    .sort((a, b) => a.mmrDelta - b.mmrDelta)
  const equilibriumValue = quantile(
    games.map((x) => x.mmrDelta),
    0.5
  )
  const topHalf = games.filter((x) => x.mmrDelta <= equilibriumValue)
  const RoleScored = topHalf.map((x) => {
    const team1Order = getTeamOrder(x.team1.players, input)
    const team2Order = getTeamOrder(x.team2.players, input)
    return {
      ...x,
      roleScore: team1Order.roleScore + team2Order.roleScore,
      team1: {
        ...x.team1,
        players: team1Order.order,
        roleScore: team1Order.roleScore,
      },
      team2: {
        ...x.team2,
        players: team2Order.order,
        roleScore: team2Order.roleScore,
      },
    }
  })
  const output = RoleScored.map((x) => prettyOutput(x, input))
  return output
    .sort((a, b) => {
      if (b.metadata.roleScore - a.metadata.roleScore === 0)
        if (b.metadata.delta - a.metadata.delta === 0)
          if (b.metadata.laneDelta - a.metadata.laneDelta === 0)
            return (
              Math.abs(a.red.roleScore - a.blue.roleScore) -
              Math.abs(b.red.roleScore - b.blue.roleScore)
            )
          else return a.metadata.laneDelta - b.metadata.laneDelta
        else return a.metadata.delta - b.metadata.delta
      return b.metadata.roleScore - a.metadata.roleScore
    })
    .slice(0, 100)
}

module.exports = function (
  input: Array<{ name: string; elo: string; roles: string[] }>
): Array<object> {
  inputSchema.validateSync(input)
  return matchmaking(input)
}
