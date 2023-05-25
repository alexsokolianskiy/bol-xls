var XLSX = require("xlsx");
var fs = require("fs");
var wb = XLSX.readFile("xls/RESINV.xlsx");
var range = XLSX.utils.decode_range("A1:Z5000");
const json = XLSX.utils.sheet_to_json(wb.Sheets['Full_View'], {
    range: range
});
const tags = [];
json.forEach((row) => {
    if ([undefined, ''].includes(row['XML Tag'])) return;
    tags.push({
        name: row['Name'] ? row['Name'].trim() : '',
        tag: row['XML Tag'],
        path: row['Path'] ?? '',
        required: row['Min Mand'] === 'Yes' ? true : false,
        description: row['Definition'] ? row['Definition'].replace(/[\r\n]+/g, ' ').trim() : '',
        type: row['Type / Code'] ? row['Type / Code'].replace(/[\r\n]+/g, ' ').trim() : '',
    })
});
function buildTree(data) {
    const root = {
        children: []
    };

    data.forEach(item => {
        const pathSegments = item.path.split("/");
        let currentNode = root;

        pathSegments.forEach(segment => {
            let childNode = currentNode.children.find(node => node.name === segment);
            if (!childNode) {
                childNode = {
                    name: segment,
                    children: []
                };
                currentNode.children.push(childNode);
            }
            currentNode = childNode;
        });

        currentNode.value = item;
    });

    return root;
}

const tree = buildTree(tags);
var file=  JSON.stringify(tree, null, 2);
fs.writeFileSync('output/RESINV.json', file);
