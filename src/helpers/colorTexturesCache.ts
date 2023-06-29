import * as PIXI from 'pixi.js'

type TextureType = 'square' | 'circle'

window.textureCache = {
  square: {},
  circle: {}
}

export function getTextureForColor(hexWithHastag: string, type: TextureType) {
  if (!window.textureCache[type][hexWithHastag]) {
    window.textureCache[type][hexWithHastag] = PIXI.Texture.from(
      `/textures/${type}/${hexWithHastag.replace('#', '')}.png`
    )
  }
  return window.textureCache[type][hexWithHastag]
}
