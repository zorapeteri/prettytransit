import * as PIXI from 'pixi.js'

type TextureType = 'square' | 'circle'

window.textureCache = {
  square: {},
  circle: {}
}

export function getTextureForColor(hexWithHashtag: string, type: TextureType) {
  if (!window.textureCache[type][hexWithHashtag]) {
    window.textureCache[type][hexWithHashtag] = PIXI.Texture.from(
      `/textures/${type}/${hexWithHashtag.replace('#', '')}.png`
    )
  }
  return window.textureCache[type][hexWithHashtag]
}
