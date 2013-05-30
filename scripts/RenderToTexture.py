#    Tutorial for using RenderToTexture.py can be found at www.tutorialsforblender3d.com
#    Released under the Creative Commons Attribution 3.0 Unported License.	If you use this code, please include this information header.

import GameLogic as g

cont = g.getCurrentController()
obj = cont.owner

for scene in g.getSceneList():
    if scene.name == "Main": break

if "RenderToTexture" in obj:
	obj["RenderToTexture"].refresh(True)
else:
    import VideoTexture
    cam = scene.objects[obj["camera"]]
    matID = VideoTexture.materialID(obj, "MA"+ obj["material"])
    renderToTexture = VideoTexture.Texture(obj, matID)
    renderToTexture.source = VideoTexture.ImageRender(scene,cam)
    obj["RenderToTexture"] = renderToTexture	