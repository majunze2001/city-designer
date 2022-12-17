// variable to hold a reference to our A-Frame world
let world;
// world has 100 * 100 floor

// dynamic texture buffer for the control panel for 2D map
let buffer;

// mouse click control for placing items
let mouseCooldown = false;

// our robot array
let robots = [];

let buildings = [];
let roads = [];

let house;
let container;

//cells in the map to enable "snapping to the center"
const CELLSIZE = 16;

const metaData = {
    office: { width: 25.8855224609375, height: 10.034808593750002, depth: 13.216087890625001, scaleX: 0.004, scaleY: 0.004, scaleZ: 0.004, color: 'blue' },
    apartment: { width: 11.16, height: 32.270357421875, depth: 11.160000000000007, scaleX: 0.002, scaleY: 0.002, scaleZ: 0.002, color: 'green' },
    hotel: { width: 13.3318046875, height: 32.49719921875, depth: 10.260000000000007, scaleX: 0.002, scaleY: 0.002, scaleZ: 0.002, color: 'yellow' },
    school: { width: 15.593930295606384, height: 2.7636838552358176, depth: 13.23675282317538, scaleX: 6, scaleY: 6, scaleZ: 6, color: 'white' },
    park: { width: 15.79386771185991, height: 3.7725342235708226, depth: 20.622415521049966, scaleX: 0.3, scaleY: 0.3, scaleZ: 0.3, color: 'orange' },
    stadium: { width: 14.545368671417236, height: 5.813395023345947, depth: 14.63379716873169, scaleX: 4, scaleY: 4, scaleZ: 4, color: 'pink' },
};

const brick = {
    road: { width: 100 / (512 / CELLSIZE), height: 100 / (512 / CELLSIZE), color: 'grey' },
    turn: { width: 100 / (512 / CELLSIZE), height: 100 / (512 / CELLSIZE), color: 'grey' },
};

let music;
let bgm,
    playBgm = 0;
let choice = 'road';
let addMode = 1;

function preload() {
    music = loadSound('assets/sounds/bubble.mp3');
    bgm = loadSound('assets/sounds/SimCity.mp3');
    // need bgm
}

function mouseClicked() {
    if (house) {
        const t = getDimensions(house.tag.object3D);
        console.log(t);
    }
}

// document.addEventListener('DOMContentLoaded', function () {
//     console.log(world.camera.cameraEl.components['look-controls'].yawObject);
// });

class Preview {
    constructor(xOffset, yOffset, zOffset, parentObject) {
        this.body = new Container3D({
            x: xOffset,
            y: yOffset,
            z: zOffset,
        });
        parentObject.add(this.body);

        this.preview = new Container3D({ y: 1 });
        this.body.add(this.preview);

        this.displayPreview();

        //preview rotate buttons
        const rotateBtnY = 0;

        const rotateLeftBtn = new Tetrahedron({
            x: -1,
            y: rotateBtnY,
            z: 0,
            radius: 0.5,
            red: 0,
            green: 0,
            blue: 255,
            enterFunction: function (entity) {
                entity.setScale(1.5, 1.5, 1.5);
            },
            leaveFunction: function (entity) {
                entity.setScale(1, 1, 1);
            },
            clickFunction: (entity) => {
                this.rotatePreview(-90);
            },
        });

        const rotateRightBtn = new Tetrahedron({
            x: 0.5,
            y: rotateBtnY,
            z: 0,
            radius: 0.5,
            red: 0,
            green: 0,
            blue: 255,
            enterFunction: function (entity) {
                entity.setScale(1.5, 1.5, 1.5);
            },
            leaveFunction: function (entity) {
                entity.setScale(1, 1, 1);
            },
            clickFunction: (entity) => {
                this.rotatePreview(90);
            },
        });

        this.body.add(rotateLeftBtn);
        this.body.add(rotateRightBtn);
    }

    getPreview() {
        return this.preview.getChildren()[0];
    }

    rotatePreview(deg) {
        Object.hasOwn(brick, choice) ? this.getPreview().spinZ(deg) : this.getPreview().spinY(deg);
    }

    getPreviewRotation() {
        return Object.hasOwn(brick, choice) ? this.getPreview().getRotationZ() : this.getPreview().getRotationY();
    }

    displayPreview() {
        while (this.preview.getChildren()[0]) {
            this.preview.removeChild(this.preview.getChildren()[0]);
        }
        const previewModel = Object.hasOwn(brick, choice)
            ? new Plane({
                  y: 0.5,
                  asset: choice,
              })
            : new GLTF({
                  asset: choice,
                  scaleX: metaData[choice].scaleX / 8,
                  scaleY: metaData[choice].scaleY / 8,
                  scaleZ: metaData[choice].scaleZ / 8,
              });
        this.preview.addChild(previewModel);
    }
}

// wrap all controls in a container
const initControlPanel = (_x, _y, _z) => {
    const controlContainer = new Container3D({ x: _x, y: _y, z: _z });
    world.add(controlContainer);
    world.setUserPosition(_x, _y + 2, _z + 6);

    const preview = new Preview(-5, 0.5, 0, controlContainer);

    // create our off screen graphics buffer & texture for panel
    buffer = createGraphics(512, 512);
    texture = world.createDynamicTextureFromCreateGraphics(buffer);

    const addRoadToWorld = (entity, intersectionInfo) => {
        //collision detection
        let w = CELLSIZE;
        let h = CELLSIZE;
        let cellX = parseInt(intersectionInfo.point2d.x / CELLSIZE);
        let cellY = parseInt(intersectionInfo.point2d.y / CELLSIZE);

        let road_X = cellX * CELLSIZE + CELLSIZE / 2;
        let road_Y = cellY * CELLSIZE + CELLSIZE / 2;

        if (preview.getPreviewRotation() % 180 !== 0) {
            const t = w;
            w = h;
            h = t;
        }
        const pointsOffsets = [
            [0, 0],
            [w / 2 - 1, h / 2 - 1],
            [w / 2 - 1, -h / 2 + 1],
            [-w / 2 + 1, h / 2 - 1],
            [-w / 2 + 1, -h / 2 + 1],
        ];

        const colors = pointsOffsets.map(([x, y]) => buffer.get(road_X + x, road_Y + y));
        const colored = colors.filter((c) => !c.every((value, index) => value === [0, 0, 0, 255][index]));

        if (colored.length > 0) {
            buffer.fill('red');
            buffer.rectMode(CENTER);
            buffer.rect(road_X, road_Y, CELLSIZE, h);
        } else {
            // adding
            buffer.fill(brick[choice].color);
            buffer.rectMode(CENTER);
            buffer.rect(road_X, road_Y, w, h);
            // if the mouse is currently pressed we should create a Robot here on the floor
            if (mouseIsPressed && !mouseCooldown) {
                mouseCooldown = true;
                roads.push(new Road(road_X, road_Y, preview.getPreviewRotation()));
                setTimeout(() => (mouseCooldown = false), 50);
            }
        }
    };

    const addBuildingToWorld = (entity, intersectionInfo) => {
        // collision detecting
        let w = map(metaData[choice].width, 0, 100, 0, 512);
        let h = map(metaData[choice].depth, 0, 100, 0, 512);

        if (preview.getPreviewRotation() % 180 !== 0) {
            const t = w;
            w = h;
            h = t;
        }
        const pointsOffsets = [
            [0, 0],
            [w / 2, h / 2],
            [w / 2, -h / 2],
            [-w / 2, h / 2],
            [-w / 2, -h / 2],
        ];
        // get the colors of all detect positions
        const colors = pointsOffsets.map(([x, y]) => buffer.get(intersectionInfo.point2d.x + x, intersectionInfo.point2d.y + y));
        const colored = colors.filter((c) => !c.every((value, index) => value === [0, 0, 0, 255][index]));
        if (colored.length > 0) {
            // collision
            buffer.fill('red');
            buffer.rectMode(CENTER);
            buffer.rect(intersectionInfo.point2d.x, intersectionInfo.point2d.y, w, h);
        } else {
            // adding
            buffer.fill(metaData[choice].color);
            buffer.rectMode(CENTER);
            buffer.rect(intersectionInfo.point2d.x, intersectionInfo.point2d.y, w, h);
            // if the mouse is currently pressed we should create a Robot here on the floor
            if (mouseIsPressed && !mouseCooldown) {
                mouseCooldown = true;
                buildings.push(
                    new Building(
                        intersectionInfo.point2d.x,
                        intersectionInfo.point2d.y,
                        choice,
                        metaData[choice].scaleX,
                        metaData[choice].scaleY,
                        metaData[choice].scaleZ,
                        metaData[choice].color,
                        preview.getPreviewRotation()
                    )
                );
                setTimeout(() => (mouseCooldown = false), 1000);
            }
        }
    };

    const removeEntityFromWorld = (entity, intersectionInfo) => {
        //removing
        buffer.fill(255, 0, 0);
        buffer.rectMode(CENTER);
        buffer.rect(intersectionInfo.point2d.x, intersectionInfo.point2d.y, 20, 20);

        if (mouseIsPressed) {
            buildings.forEach((b, i) => {
                const w = map(metaData[b.asset].width, 0, 100, 0, 512);
                const h = map(metaData[b.asset].depth, 0, 100, 0, 512);
                // just for easy, consider them as circles
                const r = h - (h >> 2) + (w >> 2);
                let bufferX = map(b.x, -50, 50, 0, 512);
                let bufferY = map(b.z, -50, 50, 0, 512);
                const d = dist(intersectionInfo.point2d.x, intersectionInfo.point2d.y, bufferX, bufferY);
                if (d <= r + 10) {
                    console.log('found');
                    b.removeFromWorld();
                    buildings.splice(i, 1);
                    return;
                }
            });
            roads.forEach((b, i) => {
                const w = CELLSIZE;
                const h = CELLSIZE;
                // just for easy, consider them as circles
                const r = h - (h >> 2) + (w >> 2);
                let bufferX = map(b.x, -50, 50, 0, 512);
                let bufferY = map(b.z, -50, 50, 0, 512);
                const d = dist(intersectionInfo.point2d.x, intersectionInfo.point2d.y, bufferX, bufferY);
                if (d <= r + 10) {
                    console.log('found');
                    b.removeFromWorld();
                    roads.splice(i, 1);
                    return;
                }
            });
        }
    };

    const panel = new Plane({
        width: 5,
        height: 5,
        // relative to _x, _y, _z
        x: 0,
        y: 2.5,
        z: 0,
        dynamicTexture: true,
        asset: texture,
        dynamicTextureWidth: 512,
        dynamicTextureHeight: 512,
        enterFunction: function (e) {
            world.camera.cameraEl.setAttribute('look-controls', 'enabled: false');
        },
        leaveFunction: function (e) {
            world.camera.cameraEl.setAttribute('look-controls', 'enabled: true');
        },
        overFunction: function (entity, intersectionInfo) {
            if (addMode) {
                if (Object.hasOwn(brick, choice)) {
                    // add bricks
                    addRoadToWorld(entity, intersectionInfo);
                } else {
                    // add a building
                    addBuildingToWorld(entity, intersectionInfo);
                }
            } else {
                // remove road brick/building
                removeEntityFromWorld(entity, intersectionInfo);
            }
        },
    });
    controlContainer.add(panel);

    // display choices
    const startPos = { x: 3.5, y: 4, z: 0 };

    Object.entries(metaData).forEach(([key, data]) => {
        const c = color(data.color);
        const btn = new Plane({
            width: 0.5,
            height: 0.5,
            x: startPos.x,
            y: startPos.y,
            z: startPos.z,
            red: red(c),
            green: green(c),
            blue: blue(c),
            enterFunction: function (entity) {
                entity.setScale(1.5, 1.5, 1.5);
            },
            leaveFunction: function (entity) {
                entity.setScale(1, 1, 1);
            },

            clickFunction: function (entity) {
                console.log(`${key} btn clicked`);
                choice = key;
                preview.displayPreview();
                addMode = 1;
            },
        });

        const name = new Text({ text: key, red: 0, green: 0, blue: 0, x: 0.8, scaleX: 5, scaleY: 5, scaleZ: 5 });
        btn.add(name);
        startPos.y -= 0.5;
        controlContainer.add(btn);
    });

    // const startPos = { x: 3, y: 27, z: -5 };

    startPos.x = 5.5;
    startPos.y = 4;

    Object.entries(brick).forEach(([key, data]) => {
        const c = color(data.color);
        const btn = new Plane({
            width: 0.5,
            height: 0.5,
            asset: key,
            x: startPos.x,
            y: startPos.y,
            z: startPos.z,
            red: red(c),
            green: green(c),
            blue: blue(c),
            enterFunction: function (entity) {
                entity.setScale(1.5, 1.5, 1.5);
            },
            leaveFunction: function (entity) {
                entity.setScale(1, 1, 1);
            },
            clickFunction: function (entity) {
                console.log(`${key} btn clicked`);
                choice = key;
                preview.displayPreview();
                addMode = 1;
            },
        });

        // name tag
        const name = new Text({ text: key, red: 0, green: 0, blue: 0, x: 0.6, scaleX: 5, scaleY: 5, scaleZ: 5 });
        btn.add(name);

        startPos.y -= 1;
        controlContainer.add(btn);
    });

    const removeBtnY = 0;

    // when clicked this will remove all buildings from the world
    const clearButton = new Sphere({
        red: 255,
        green: 0,
        blue: 0,
        radius: 0.25,
        x: -1,
        y: removeBtnY,
        z: 2,
        enterFunction: function (entity) {
            entity.setScale(1.25, 1.25, 1.25);
        },
        leaveFunction: function (entity) {
            entity.setScale(1, 1, 1);
        },
        clickFunction: function (entity) {
            while (buildings.length > 0) {
                buildings[0].removeFromWorld();
                buildings.splice(0, 1);
            }
            while (roads.length > 0) {
                roads[0].removeFromWorld();
                roads.splice(0, 1);
            }
        },
    });
    controlContainer.add(clearButton);

    const editButton = new Box({
        red: 0,
        green: 255,
        blue: 0,
        width: 0.5,
        height: 0.5,
        depth: 0.5,
        x: 1,
        y: removeBtnY,
        z: 2,
        clickFunction: function (entity) {
            addMode ^= 1;
        },
        enterFunction: function (entity) {
            entity.setScale(1.25, 1.25, 1.25);
        },
        leaveFunction: function (entity) {
            entity.setScale(1, 1, 1);
        },
    });
    controlContainer.add(editButton);
};

function setup() {
    // no canvas needed
    noCanvas();

    // construct the A-Frame world
    world = new World('VRScene');

    // cannot rotate, uninitialized
    // console.log(world.camera.cameraEl.components['look-controls'].yawObject);
    // world.camera.cameraEl.object3D.rotation.set(-Math.PI / 6, 0, 0);

    const sky = new Sky({
        asset: 'sky',
    });
    world.add(sky);

    // floor for placing the buildings
    let floor = new Plane({ width: 100, height: 100, asset: 'grass', repeatX: 100, repeatY: 100, rotationX: -90 });
    world.add(floor);

    // sample
    // house = new GLTF({ asset: 'stadium', x: 2, y: 0, z: -5, scaleX: 2, scaleY: 2, scaleZ: 2 });
    // world.add(house);

    // box.add(house);
    // world.add(box);

    // control panel
    initControlPanel(0, 5, 50);

    // world.camera.cameraEl.object3D.rotation.set(-Math.PI / 6, 0, 0);
    // world.camera.cameraEl.setAttribute('rotation', '0,3.14,0');
    // world.camera.cameraEl.components['look-controls'].yawObject.rotation.set(0, Math.PI / 2, 0);
}

function draw() {
    buffer.clear();
    buffer.background(0);
    for (const b of buildings) {
        b.displayControlPanel();
    }

    // console.log(world.camera.cameraEl.object3D.rotation);
    // robots.forEach((b) => {
    //     b.updateControlPanel();
    //     b.move();
    // });
    // if (frameCount % 30 === 0) {
    //     robots.push(new Robot());
    // }
    // robots = robots.filter((r) => r.x <= 50);

    for (let i = 0; i < roads.length; i++) {
        roads[i].updateControlPanel();
    }

    const cameraWindow = document.querySelector('iframe')?.contentWindow;
    if (cameraWindow && cameraWindow.addHiro) {
        console.log('I should do something here');
        cameraWindow.addHiro = false;
    }
}

class Road {
    constructor(_x, _z, rotationY = 0) {
        // convert from buffer coords (512x512) to world coords (100x100)
        this.x = map(_x, 0, 512, -50, 50);
        this.z = map(_z, 0, 512, -50, 50);
        this.length = map(CELLSIZE, 0, 512, -50, 50);
        this.asset = choice;
        this.color = 'grey';

        this.r = red(this.color);
        this.g = red(this.color);
        this.b = red(this.color);

        this.body = new Plane({
            asset: this.asset,
            x: this.x,
            y: 0.1,
            z: this.z,
            rotationX: -90,
            rotationY: rotationY,
            width: brick[choice].width,
            height: brick[choice].height,
        });
        world.add(this.body);
    }

    updateControlPanel() {
        // update the buffer with our current position
        buffer.fill(this.r, this.g, this.b);
        buffer.rectMode(CENTER);

        // convert back out to buffer coords
        let bufferX = map(this.x, -50, 50, 0, 512);
        let bufferY = map(this.z, -50, 50, 0, 512);
        buffer.rect(bufferX, bufferY, CELLSIZE, CELLSIZE);
    }

    removeFromWorld() {
        // remove this robot's body from the world
        world.remove(this.body);
    }
}

// our Robot class that will randomly wander
class Robot {
    constructor() {
        // convert from buffer coords (512x512) to world coords (100x100)
        this.x = -50;
        this.z = -15;
        this.noiseLocationX = random(1000);
        this.noiseLocationZ = random(1000);

        // pick a color for this robot
        this.r = random(255);
        this.g = random(255);
        this.b = random(255);

        this.body = new Container3D({
            x: this.x,
            y: 0.5,
            z: this.z,
        });
        const head = new Dodecahedron({
            x: 0,
            y: 1,
            z: -5,
            radius: 0.5,
            red: this.r,
            green: this.g,
            blue: this.b,
        });
        this.body.add(head);
        const trunk = new Cylinder({
            x: 0,
            y: 0,
            z: -5,
            red: random(255),
            green: random(255),
            blue: random(255),
            radius: 0.5,
            clickFunction: function (entity) {
                console.log('robot clicked');
                this.speed = 0.4;
                entity.setBlue(0);
                entity.setGreen(0);
                entity.setRed(255);
            },
        });
        this.body.add(trunk);
        world.add(this.body);
    }

    updateControlPanel() {
        // update the buffer with our current position
        buffer.fill(this.r, this.g, this.b);
        buffer.rectMode(CENTER);

        // convert back out to buffer coords
        let bufferX = map(this.x, -50, 50, 0, 512);
        let bufferY = map(this.z, -50, 50, 0, 512);
        buffer.rect(bufferX, bufferY, 5, 5);
    }

    move() {
        // go towards our destination
        this.x += this.speed || map(noise(this.noiseLocationX), 0, 1, 0, 0.2);
        this.z = constrain(map(noise(this.noiseLocationZ), 0, 1, -0.1, 0.1) + this.z, -18, -12);
        // update our position
        this.body.setPosition(this.x, 0.5, this.z);

        this.noiseLocationZ += 0.01;
        this.noiseLocationX += 0.01;
        // have we arrived?  if so, remove
        if (this.x > 50) {
            music.play();
            this.removeFromWorld();
        }
    }

    removeFromWorld() {
        // remove this robot's body from the world
        world.remove(this.body);
    }
}

class Building {
    constructor(_x, _z, asset, scaleX, scaleY, scaleZ, color = 'blue', rotationY = 0) {
        // convert from buffer coords (512x512) to world coords (100x100)
        this.x = map(_x, 0, 512, -50, 50);
        this.z = map(_z, 0, 512, -50, 50);
        this.asset = asset;
        this.color = color;
        this.body = new GLTF({
            asset: asset,
            x: this.x,
            y: 0.1,
            z: this.z,
            scaleX: scaleX,
            scaleY: scaleY,
            scaleZ: scaleZ,
            rotationY: rotationY,
        });
        world.add(this.body);

        // a box for detecting clicks
        this.wrapper = new Box({
            x: this.x,
            y: 0,
            z: this.z,
            visible: false,
            clickFunction: function (entity) {
                // console.log('clicked');
                // world.slideToObject(entity, 2000);
            },
            width: metaData[asset].width,
            height: metaData[asset].height,
            depth: metaData[asset].depth,
        });
        world.add(this.wrapper);
    }

    displayControlPanel() {
        // display on the buffer with our current position
        buffer.fill(this.color);
        buffer.rectMode(CENTER);

        const dimensions = this.getDimensions();

        // get choice
        // this.choice, this.w, this.h
        let bufferX = map(this.x, -50, 50, 0, 512);
        let bufferY = map(this.z, -50, 50, 0, 512);
        // world is 100 * 100 and buffer is 512 * 512
        const w = map(dimensions.width, 0, 100, 0, 512);
        const h = map(dimensions.depth, 0, 100, 0, 512);
        buffer.rect(bufferX, bufferY, w, h);
    }

    getDimensions() {
        return getDimensions(this.body.tag.object3D);
    }

    removeFromWorld() {
        // remove this robot's body from the world
        world.remove(this.body);
        world.remove(this.wrapper);
    }
}

function viewWorld() {
    world.setUserPosition(0, 1, 40);
    const { x, y, z } = world.getUserRotation();
    // world.rotateCameraX((x * -180) / PI);
    // world.rotateCameraY((y * -180) / PI);
    // world.rotateCameraZ((z * -180) / PI);
}

function editWorld() {
    world.setUserPosition(0, 25, 1);
    const { x, y, z } = world.getUserRotation();
    // world.rotateCameraX((x * -180) / PI);
    // world.rotateCameraY((y * -180) / PI);
    // world.rotateCameraZ((z * -180) / PI);
}

function switchCamera() {
    document.querySelector('#VRScene').classList.toggle('hidden');
    const btns = document.querySelector('#panel').children;
    myForEach(btns, (b) => b.classList.toggle('hidden'));
    if (document.querySelector('iframe')) {
        document.querySelector('iframe').remove();
    } else {
        const camera = document.body.appendChild(document.createElement('iframe'));
        camera.src = 'camera.html';
    }
}

// helpers
function getDimensions(object3d) {
    // https://stackoverflow.com/questions/51380941/aframe-size-of-model
    const box = new THREE.Box3().setFromObject(object3d);
    const x = box.max.x - box.min.x;
    // console.log(box.max.x, box.min.x);
    const y = box.max.y - box.min.y;
    const z = box.max.z - box.min.z;
    return { width: x, height: y, depth: z };
}

function myForEach(collection, cb) {
    Array.prototype.forEach.call(collection, cb);
}

function switchBgm(e) {
    e.target.children.forEach((c) => c.classList.toggle('hidden'));
    if (!bgm || !bgm.isLoaded()) {
        console.log('bgm not ready');
    } else {
        playBgm ? bgm.pause() : bgm.play();
        playBgm ^= 1;
    }
}
