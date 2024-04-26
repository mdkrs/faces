export function getCSRF() {
    return $('[name="csrfmiddlewaretoken"]').attr('value');
}

export function embedsError(face_a, face_b) {
    var embeds_a = JSON.parse(face_a.embeds_json);
    var embeds_b = JSON.parse(face_b.embeds_json);
    if (embeds_a.length !== embeds_b.length) {
        return Infinity;
    }
    var dif = embeds_a.map((num, index) => (num - embeds_b[index])*(num - embeds_b[index]));
    return dif.reduce((acc, el) => acc + el, 0);
}

export function faceNodeName(face) {
    return face.img.toString() + "/" + face.id.toString()
}

export function buildNodes(images) {
    var nodes = {};
    images.map((img) => {
        img.faces.map((face) => {
            var node = faceNodeName(face);
            nodes[node] = face
        });
    });
    return nodes;
}

export function buildGraph(images) {
    var graph = {};
    images.map((img) => {
        img.faces.map((face) => {
            var node = faceNodeName(face);
            graph[node] = {}
            images.map((img2) => {
                img2.faces.map((face2) => {
                    var node2 = faceNodeName(face2);
                    if (face.img !== face2.img) {
                        graph[node][node2] = embedsError(face, face2);
                    }
                });
            });
        });
    });
    return graph;
}

function bfs(st, color, accuracy, nodes, graph, was) {
    var queue = [st];
    was[st] = color;
    for (var i = 0; i < queue.length; ++i) {
        var node = queue[i];
        for (var to_node in graph[node]) {
            if (!was[to_node] && graph[node][to_node] <= accuracy) {
                was[to_node] = color;
                queue.push(to_node);
            }
        }
    }
    return queue;
}

export function groupFaces(images, accuracy, nodes, graph) {
    var groups = [];
    var was = {};
    var color = 1;
    for (var node in nodes) {
        if (!was[node]) {
            const comp = bfs(node, color, accuracy, nodes, graph, was);
            groups.push(comp);
            color += 1;
        }
    }
    return groups;
}
