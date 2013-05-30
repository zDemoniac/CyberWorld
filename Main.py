import Rasterizer
import GameLogic

units = ["Unit0","Unit1"] # Unit types
buildings = ["Base01", "Factory01"]
scene = GameLogic.getCurrentScene()

def deselectAll():
    for obj in scene.objects:
        if "Selected" in obj.name:
            obj.setVisible(False)

def addUnit():
    spawn = scene.objects["SpawnUnit"]
    unit   = scene.addObject("Unit0", spawn, 0)
    target = scene.addObject("Unit0.Target", spawn, 0)
    nextId = scene.objects["Camera"]["nextId"]
    unit["id"] = nextId
    target["id"] = nextId
    scene.objects["Camera"]["selected"] = nextId
    scene.objects["Camera"]["nextId"] += 1
    unit.actuators["Steering"].target = target 
    unit.children["Unit0.Selected"].setVisible(True)
    target.localPosition.y -= 6

def getHud():
    for sceneHUD in GameLogic.getSceneList():
        if sceneHUD.name == "HUD": break
    return sceneHUD

def infoPanelShow(obj):
    sceneHUD = getHud()
    sceneHUD.objects["InfoPanel"].setVisible(True, True)
    info = sceneHUD.objects["InfoPanelText1"]
    info["Text"] = obj["description"]

def infoPanelHide():
    sceneHUD = getHud()
    sceneHUD.objects["InfoPanel"].setVisible(False, True)

def onMouse():
    Rasterizer.showMouse(True)
    cont = GameLogic.getCurrentController()
    mouse = cont.sensors["Mouse"]
    over = cont.sensors["Over"]

    if mouse.positive:
        hit = over.hitObject

        if hit is None: 
            return
        
        print(hit.name)
        print(hit.children)

        if hit.name in buildings:
            deselectAll()
            hit.children["Base01.Selected"].setVisible(True)
            infoPanelShow(hit)
            addUnit()
        else:
            if hit.name in units:
                deselectAll()
                hit.children["Unit0.Selected"].setVisible(True)
                cont.owner["selected"] = hit["id"]
                infoPanelShow(hit)
            else:
                for target in scene.objects:
                    if "Target" in target.name and target["id"] == cont.owner["selected"]:
                        target.localPosition = over.hitPosition
        