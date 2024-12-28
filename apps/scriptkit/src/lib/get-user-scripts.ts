import path from 'path'
import {Octokit} from '@octokit/rest'
import {LoadedScript} from 'utils/types'
import _ from 'lodash'
import {readJson} from 'fs-extra'

const cwd = process.cwd

const octokit = new Octokit()

export const getAllScripts = async (): Promise<LoadedScript[]> => {
  let shareScripts = await readJson(
    path.resolve(cwd(), 'public', 'data', 'share.json'),
  )

  let reposScripts = await readJson(
    path.resolve(cwd(), 'public', 'data', 'repo-scripts.json'),
  )

  return shareScripts.concat(reposScripts)
}

export interface UserScripts {
  [user: string]: LoadedScript[]
}

export const getAllScriptsGroupedByUser = async (): Promise<UserScripts> => {
  const scripts = await getAllScripts()

  return _.groupBy(scripts, 'user')
}

export const getAllUsers = async (): Promise<string[]> => {
  const scripts = await getAllScripts()
  const users = scripts.map((s) => s.user)
  return _.uniq(users)
}

export const getScriptsByUser = async (
  user: string,
): Promise<LoadedScript[]> => {
  const scripts = await getAllScripts()

  return scripts.filter((s) => s.user === user)
}

interface ScriptPath {
  paths: {
    params: {
      user: string
      script: string
    }
  }[]
  fallback: boolean
}
export async function getScriptPaths(): Promise<ScriptPath> {
  const paths = []

  const scripts = await getAllScripts()
  for await (const script of scripts) {
    paths.push({
      params: {
        user: script.user,
        script: script.command,
      },
    })
  }

  return {
    paths,
    fallback: false,
  }
}

export async function getScript(
  user: string,
  command: string,
): Promise<LoadedScript | undefined> {
  const scripts = await getAllScripts()
  return scripts.find((d) => user === d.user && command === d.command)
}

type PromiseType<T extends Promise<any>> = T extends Promise<infer U>
  ? U
  : never

type ListReleasesReturnType = PromiseType<
  ReturnType<typeof octokit.repos.listReleases>
>

let releases: ListReleasesReturnType['data'] = []
export async function getReleases() {
  if (releases.length) {
    return releases
  }

  const releaseResponse1 = await octokit.repos.listReleases({
    owner: 'johnlindquist',
    repo: 'kitapp',
    per_page: 100,
    page: 1,
  })

  const releaseResponse2 = await octokit.repos.listReleases({
    owner: 'johnlindquist',
    repo: 'kitapp',
    per_page: 100,
    page: 2,
  })

  const releaseResponse3 = await octokit.repos.listReleases({
    owner: 'johnlindquist',
    repo: 'kitapp',
    per_page: 100,
    page: 3,
  })

  const releaseResponse4 = await octokit.repos.listReleases({
    owner: 'johnlindquist',
    repo: 'kitapp',
    per_page: 100,
    page: 4,
  })

  const releaseResponse5 = await octokit.repos.listReleases({
    owner: 'johnlindquist',
    repo: 'kitapp',
    per_page: 100,
    page: 5,
  })

  releases = [
    ...releaseResponse1.data,
    ...releaseResponse2.data,
    ...releaseResponse3.data,
    ...releaseResponse4.data,
    ...releaseResponse5.data,
  ]
  console.log(`Releases`, releases.length)

  return releases
}

export async function getLatestMacIntelRelease() {
  const releases = await getReleases()

  const mainRelease = releases.find(
    (release) =>
      !release?.name?.includes('beta') &&
      !release?.name?.includes('alpha') &&
      !release.prerelease &&
      release?.assets?.find((a) => a.name.includes('dmg')),
  )

  const release = mainRelease?.assets.find(
    (asset) =>
      !asset?.name?.includes('beta') &&
      !asset?.name?.includes('alpha') &&
      !asset?.name?.includes('arm') &&
      asset?.name?.endsWith('.dmg'),
  )

  console.log(`Mac Intel Release:`, release?.name)

  return release
}

// export const getLatestReleaseMemo = memoizerific(1)(getLatestRelease)

export async function getLatestAppleSiliconRelease() {
  const releases = await getReleases()

  const mainRelease = releases.find(
    (release) =>
      !release?.name?.includes('beta') &&
      !release?.name?.includes('alpha') &&
      !release.prerelease &&
      release?.assets?.find((a) => a.name.includes('dmg')),
  )

  const release = mainRelease?.assets.find(
    (asset) =>
      !asset?.name?.includes('beta') &&
      !asset?.name?.includes('alpha') &&
      asset?.name?.includes('arm') &&
      asset?.name?.endsWith('.dmg'),
  )

  console.log(`Apple Silicon Release:`, release?.name)

  return release
}

export async function getLatestWindowsx64Release() {
  const releases = await getReleases()

  const mainRelease = releases.find(
    (release) =>
      !release?.name?.includes('beta') &&
      !release?.name?.includes('alpha') &&
      !release.prerelease &&
      release?.assets?.find((a) => a.name.includes('exe')),
  )

  const release = mainRelease?.assets.find(
    (asset) =>
      !asset?.name?.includes('beta') &&
      !asset?.name?.includes('alpha') &&
      !asset?.name?.includes('arm') &&
      asset?.name?.endsWith('.exe'),
  )

  console.log(`Windows x64 Release:`, release?.name)

  return release
}

export async function getLatestWindowsarm64Release() {
  const releases = await getReleases()

  const mainRelease = releases.find(
    (release) =>
      !release?.name?.includes('beta') &&
      !release?.name?.includes('alpha') &&
      !release.prerelease &&
      release?.assets?.find((a) => a.name.includes('exe')),
  )

  const release = mainRelease?.assets.find(
    (asset) =>
      !asset?.name?.includes('beta') &&
      !asset?.name?.includes('alpha') &&
      asset?.name?.includes('arm') &&
      asset?.name?.endsWith('.exe'),
  )

  console.log(`Windows ARM64 Release:`, release?.name)

  return release
}

export async function getLatestLinuxx64Release() {
  const releases = await getReleases()

  const mainRelease = releases.find(
    (release) =>
      !release?.name?.includes('beta') &&
      !release?.name?.includes('alpha') &&
      !release.prerelease &&
      release?.assets?.find((a) => a.name.includes('exe')),
  )

  const release = mainRelease?.assets.find(
    (asset) =>
      !asset?.name?.includes('arm') &&
      !asset?.name?.includes('beta') &&
      !asset?.name?.includes('alpha') &&
      asset?.name?.endsWith('AppImage'),
  )

  console.log(`Linux x64 Release:`, release?.name)

  return release
}

export async function getLatestLinuxarm64Release() {
  const releases = await getReleases()

  const mainRelease = releases.find(
    (release) =>
      !release?.name?.includes('beta') &&
      !release?.name?.includes('alpha') &&
      !release.prerelease &&
      release?.assets?.find((a) => a.name.includes('exe')),
  )

  const release = mainRelease?.assets.find(
    (asset) =>
      asset?.name?.includes('arm') &&
      !asset?.name?.includes('beta') &&
      !asset?.name?.includes('alpha') &&
      asset?.name?.endsWith('AppImage'),
  )

  console.log(`Linux ARM64 Release:`, release?.name)

  return release
}
