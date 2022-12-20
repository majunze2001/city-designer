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
let paths;
let walkers = [];
let walkerCount = 0;
const maxWalker = 10;
// let testing = false;

//cells in the map to enable "snapping to the center"
const CELLSIZE = 16;
// we need more models!!!

const metaData = {
    office: { width: 25.8855224609375, height: 10.034808593750002, depth: 13.216087890625001, scaleX: 0.004, scaleY: 0.004, scaleZ: 0.004, color: 'blue' },
    apartment: { width: 11.16, height: 32.270357421875, depth: 11.160000000000007, scaleX: 0.002, scaleY: 0.002, scaleZ: 0.002, color: 'green' },
    hotel: { width: 13.3318046875, height: 32.49719921875, depth: 10.260000000000007, scaleX: 0.002, scaleY: 0.002, scaleZ: 0.002, color: 'yellow' },
    school: { width: 15.593930295606384, height: 2.7636838552358176, depth: 13.23675282317538, scaleX: 6, scaleY: 6, scaleZ: 6, color: 'white' },
    park: { width: 15.79386771185991, height: 3.7725342235708226, depth: 20.622415521049966, scaleX: 0.3, scaleY: 0.3, scaleZ: 0.3, color: 'orange' },
    stadium: { width: 14.545368671417236, height: 5.813395023345947, depth: 14.63379716873169, scaleX: 4, scaleY: 4, scaleZ: 4, color: 'pink' },
};
let testData = Object.fromEntries(Object.keys(metaData).map((k) => [k, 0]));
const brick = {
    road: { width: 100 / (512 / CELLSIZE), height: 100 / (512 / CELLSIZE), color: 'grey' },
    turn: { width: 100 / (512 / CELLSIZE), height: 100 / (512 / CELLSIZE), color: 'grey' },
};

let bgm,
    playBgm = 0;
let choice = 'road';
let addMode = 1;
const userDefaultPosition = [0, 15, 55];
let editMode = true;

function preload() {
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
                paths = undefined;
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
            paths = undefined;
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
    // house = new GLTF({ asset: 'car', x: 2, y: 0.6, z: -5, scaleX: 0.005, scaleY: 0.005, scaleZ: 0.005, rotationY: -90 });
    // world.add(house);

    // box.add(house);
    // world.add(box);

    // control panel
    initControlPanel(0, 15, 55);

    // world.camera.cameraEl.object3D.rotation.set(-Math.PI / 6, 0, 0);
    // world.camera.cameraEl.setAttribute('rotation', '0,3.14,0');
    // world.camera.cameraEl.components['look-controls'].yawObject.rotation.set(0, Math.PI / 2, 0);

    // prettier-ignore
    // const testRoads = [[72,8],[72,24],[72,40],[72,56],[72,72],[72,88],[72,120],[72,136],[72,152],[72,168],[72,184],[72,216],[72,232],[72,104],[72,200],[88,232],[104,232],[152,232],[168,232],[184,232],[200,232],[216,232],[232,232],[120,232],[136,232],[232,248],[232,264],[232,280],[232,296],[232,312],[232,328],[232,344],[232,360],[216,360],[200,360],[184,360],[152,360],[136,360],[120,360],[104,360],[88,360],[72,360],[168,360],[72,376],[72,392],[72,408],[72,424],[72,440],[72,456],[72,472],[72,488],[72,504],[88,8],[104,8],[136,8],[152,8],[120,8]];
    // for (const [x, y] of testRoads) {
    //     roads.push(new Road(x, y));
    // }

    this.toPlay = 'school';

    // switchCamera();
}

function draw() {
    buffer.clear();
    buffer.background(0);
    for (const b of buildings) {
        b.displayControlPanel();
    }

    // console.log(world.camera.cameraEl.object3D.rotation);

    for (let i = 0; i < roads.length; i++) {
        roads[i].updateControlPanel();
    }

    walkers.forEach((w) => {
        w.display();
        w.walk();
    });
    if (paths && paths[0] && walkerCount < maxWalker && frameCount % 100 === 0 && random() < 0.5) {
        //
        console.log('add walker');
        walkerCount++;
        walkers.push(new Walker(random(paths)));
    }
    let preL = walkers.length;
    walkers = walkers.filter((w) => !w.done);
    if (walkerCount === maxWalker && preL && !walkers.length) {
        const [maxKey, maxVal] = Object.entries(testData).reduce(
            ([prevK, prevV], [k, v]) => {
                return v > prevV ? [k, v] : [prevK, prevV];
            },
            ['', 0]
            // hotel/apart/...
        );
        this.toPlay = maxVal === 0 ? 'good' : maxKey;
        console.log(this.toPlay);
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
        this._x = _x;
        this._y = _z;
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

class Building {
    constructor(_x, _z, asset, scaleX, scaleY, scaleZ, color = 'blue', rotationY = 0) {
        // convert from buffer coords (512x512) to world coords (100x100)
        // 2d
        this._x = _x;
        this._y = _z;

        // 3d
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
    world.setUserPosition(userDefaultPosition[0], userDefaultPosition[1] + 2, userDefaultPosition[2] + -2);
    world.camera.cameraEl.components['look-controls'].pitchObject.rotation.set(0, 0, 0);
    world.camera.cameraEl.components['look-controls'].yawObject.rotation.set(0, 0, 0);
    editMode = false;
    // world.rotateCameraX((x * -180) / PI);
    // world.rotateCameraY((y * -180) / PI);
    // world.rotateCameraZ((z * -180) / PI);
}

function editWorld() {
    world.setUserPosition(userDefaultPosition[0], userDefaultPosition[1] + 2, userDefaultPosition[2] + 6);
    world.camera.cameraEl.components['look-controls'].pitchObject.rotation.set(0, 0, 0);
    world.camera.cameraEl.components['look-controls'].yawObject.rotation.set(0, 0, 0);
    editMode = true;
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
        // this.toPlay = 'goodG';
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

function getPaths() {
    const t0 = Date.now();
    const coords = roads.map((r) => [r._x / CELLSIZE + 0.5, r._y / CELLSIZE + 0.5]);
    // console.log(coords);
    const indexes = coords.map(([x, y]) => (512 / CELLSIZE) * (y - 1) + x);
    indexes.sort((x, y) => x - y);

    const length = (512 * 512) / CELLSIZE / CELLSIZE + 2;
    const roadMap = new UF(length);
    const adj = new Array(length).fill([]);

    for (const [x, y] of coords) {
        // console.log(x, y);
        const index = (512 / CELLSIZE) * (y - 1) + x;
        if (y === 1) {
            roadMap.union(0, index);
        }
        if (y === 32) {
            roadMap.union(1025, index);
        }

        const neighbors = [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
        ]
            .map(([i, j]) => [x + i, y + j])
            .filter(([i, j]) => i >= 1 && i <= 32 && j >= 1 && j <= 32);
        const neighborIndexes = neighbors.map(([x, y]) => (512 / CELLSIZE) * (y - 1) + x);
        adj[index] = neighborIndexes.filter((i) => indexes.includes(i));

        adj[index].forEach((n) => {
            roadMap.union(n, index);
        });
    }

    const sourceParent = roadMap.find(0);
    const connected = sourceParent === roadMap.find(1025);

    const t1 = Date.now();
    console.log(connected, '---', t1 - t0);
    const firstLeaf = (512 / CELLSIZE) * (512 / CELLSIZE - 1) + 1;
    if (connected) {
        console.log(JSON.stringify(roads.map((r) => [r._x, r._y])));
        // find paths
        /*         const nodes = indexes.filter((i) => roadMap.find(i) === sourceParent).sort((x, y) => x - y);
        // we run DFS
        const paths = [];
        const colors = new Array(length).fill(0); //visited
        const parents = new Array(length).fill(0);
        const finishes = new Array(length).fill(0);
        let t = 0;

        const buildPath = (u) => {
            const p = [];
            while (u) {
                p.push(u);
                u = parents[u];
            }
            return p;
        };

        const dfsVisit = (u) => {
            // const [x, y] = [(u % 32) + 1, Math.ceil(u / 32)];
            t++;
            colors[u] = 1;
            for (let v of adj[u]) {
                if (!colors[v]) {
                    parents[v] = u;
                    dfsVisit[v];
                }
            }
            finishes[u] = t++;
        };

        nodes.forEach((u) => {
            if (!colors[u]) {
                dfsVisit(u);
            }
        });

        nodes.sort((u, v) => finishes[u] - finishes[v]);
        // console.log();
        path = nodes.map((n) => [(n % 32) + 1, Math.ceil(n / 32)]); */

        // recursion for finding all simple paths
        paths = [];
        // console.log(adj.filter((a) => a.length));
        const findPath = (u, p) => {
            if (p.includes(u)) {
                return;
            }
            // console.log(u);
            // console.log(adj[u]);
            for (let v of adj[u]) {
                const q = p.slice();
                q.push(u);
                findPath(v, q);
            }
            if (u >= firstLeaf) {
                p.push(u);
                paths.push(p);
            }
        };

        for (let i of indexes) {
            // console.log(i);
            if (i <= 32) {
                findPath(i, []);
            } else {
                break;
            }
        }

        const t2 = Date.now();
        console.log(paths.length, '---', t2 - t1);
        testData = Object.fromEntries(Object.keys(metaData).map((k) => [k, 0]));
        // console.log(paths);
        // our visiters will not go to cycles and will not visit dead ends!

        // walkers.push(new Walker(random(paths)));
        walkerCount = 0;
    }
}

class Walker {
    static maxSatisfactory = {
        office: 400,
        apartment: 150,
        hotel: 250,
        school: 400,
        park: 400,
        stadium: 600,
    };

    constructor(pathIndexes) {
        this.path = pathIndexes.map((i) => [(i % 32) - 0.5, Math.ceil(i / 32) - 0.5]);

        this.path.unshift([this.path[0][0], -0.5]);

        this.pos = 0;
        // x and y are in 2D map
        this.x = this.path[0][0];
        this.y = this.path[0][1];
        this.speed = 0.025;
        // this.speed = 0.1;
        this.done = false;

        // spinning for animation
        this.spinSpeed = 5;
        this.spinDeg = 0;
        this.dx = 0; //[dx, dy]
        this.dy = 1;

        // init val: half of max
        this.satisfaction = Object.fromEntries(Object.entries(Walker.maxSatisfactory).map(([k, v]) => [k, v / 2]));

        this.body = new GLTF({ asset: 'car', x: map(this.x, 0, 32, -50, 50), y: 0.6, z: -50, scaleX: 0.005, scaleY: 0.005, scaleZ: 0.005, rotationY: -90 });

        world.add(this.body);
    }

    walk() {
        if (this.pos >= this.path.length - 1) {
            // remove
            if (this.y >= 33) {
                this.done = true;
                console.log('i am removed');
                // console.log(testData);
                this.removeFromWorld();
                console.log(this.satisfaction);
                console.log(testData);
                return;
            }
            this.y += this.speed;
            return;
        }
        const [nextX, nextY] = this.path[this.pos + 1];
        if (this.spinDeg) {
            const d = this.spinDeg > 0 ? -this.spinSpeed : this.spinSpeed;
            this.body.spinY(d);
            this.spinDeg += d;
        }
        // === does not work due to floating point not precise
        if (Math.abs(this.x - nextX) <= this.speed && Math.abs(this.y - nextY) <= this.speed) {
            this.pos++;
            // turning logic
            if (this.pos < this.path.length - 1) {
                const nextDx = this.path[this.pos + 1][0] - this.path[this.pos][0];
                const nextDy = this.path[this.pos + 1][1] - this.path[this.pos][1];
                if (this.dx !== nextDx || this.dy !== nextDy) {
                    // rotate
                    if (this.dx === -1 || this.dy === 1) {
                        this.spinDeg = -90 * (nextDx || nextDy);
                    } else {
                        this.spinDeg = 90 * (nextDx || nextDy);
                    }
                    this.dx = nextDx;
                    this.dy = nextDy;
                }
            }
        } else if (Math.abs(this.x - nextX) <= this.speed) {
            this.y += this.y < nextY ? this.speed : -this.speed;
        } else if (Math.abs(this.y - nextY) <= this.speed) {
            this.x += this.x < nextX ? this.speed : -this.speed;
        }

        // move in 3d

        const _3dx = map(this.x, 0, 32, -50, 50);
        const _3dz = map(this.y, 0, 32, -50, 50);
        this.body.setX(_3dx);
        this.body.setZ(_3dz);

        // satisfaction logic
        const found = Object.fromEntries(Object.keys(Walker.maxSatisfactory).map((k) => [k, false]));
        buildings.forEach((b) => {
            const d = dist(b.x, b.z, _3dx, _3dz);
            if (d < 25) {
                // find
                this.satisfaction[b.asset]++; //constrain later
                found[b.asset] = true;
            }
        });

        Object.entries(found).forEach(([k, v]) => {
            if (!v) {
                this.satisfaction[k]--;
            }
            this.satisfaction[k] = constrain(this.satisfaction[k], -Walker.maxSatisfactory[k], Walker.maxSatisfactory[k]);
        });
    }

    display() {
        buffer.rectMode(CENTER);
        const all = Object.entries(this.satisfaction);
        // suppose all buildings have same weight
        const positive = all.filter(([k, v]) => v >= 0);
        buffer.fill(255, map(positive.length, 0, all.length, 0, 255), 0);
        // buffer.rect(map(this.x, 0, 32, 0, 512), this.y, 8, 8);
        buffer.rect(this.x * CELLSIZE, this.y * CELLSIZE, 8, 8);
    }

    removeFromWorld() {
        // remove this walker's body from the world
        Object.keys(testData).forEach((k) => {
            if (this.satisfaction[k] < 0) {
                testData[k]++;
            }
        });
        world.remove(this.body);
    }
}

class UF {
    constructor(size) {
        this.parents = [];
        for (let i = 0; i < size; i++) {
            this.parents.push(i);
        }
        this.ranks = new Array(size).fill(0);
    }

    find(p) {
        while (p != this.parents[p]) {
            p = this.parents[p];
        }
        return p;
    }

    union(p, q) {
        const rootP = this.find(p);
        const rootQ = this.find(q);
        if (rootP != rootQ) {
            if (this.ranks[rootP] < this.ranks[rootQ]) {
                this.parents[rootP] = rootQ;
                // this.ranks[rootP] = this.ranks[rootQ];
            } else if (this.ranks[rootP] > this.ranks[rootQ]) {
                this.parents[rootQ] = rootP;
                // this.ranks[rootQ] = this.ranks[rootP];
            } else {
                this.parents[rootP] = rootQ;
                this.ranks[rootQ]++;
            }
        }
    }
}
