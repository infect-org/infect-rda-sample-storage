import crypto from 'crypto';


const items = [];

for (let i = 0, n = 10000; i < n; i++) {
    items.push(Math.round(Math.random()* Number.MAX_SAFE_INTEGER));
}



const shards = new Map();
const mappingMap = new Map();

for (let i = 0, n = 10; i < n; i++) {
    const id = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
    shards.set(id, {id, items: new Set(), removedItems: 0, addedItems: 0, oldCount: 0});
}


for (const item of items) {
    let smallest;
    let smallestShard;

    for (const [id , shard] of shards.entries()) {
        const hash = crypto.createHash('sha1').update(`${item}/${id}`).digest('hex');

        if (!smallest || hash < smallest) {
            smallest = hash;
            smallestShard = shard;
        }
    }

    smallestShard.items.add(item);
    smallestShard.oldCount++;
    mappingMap.set(item, smallestShard);
}



// add n shards, rebalance
for (let i = 0, n = 20; i < n; i++) {
    const id = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
    shards.set(id, {id, items: new Set(), removedItems: 0, addedItems: 0, oldCount: 0});
}

// delete n shards
let deleteCount = 0;
for (const shard of shards.values()) {
    if (deleteCount-- === 0) break;
    shards.delete(shard.id);
}


// add n items
for (let i = 0, n = 0; i < n; i++) {
    items.push(Math.round(Math.random()* Number.MAX_SAFE_INTEGER));
}



for (const item of items) {
    let smallest;
    let smallestShard;

    for (const [id , shard] of shards.entries()) {
        const hash = crypto.createHash('sha1').update(`${item}/${id}`).digest('hex');

        if (!smallest || hash < smallest) {
            smallest = hash;
            smallestShard = shard;
        }
    }

    const oldSahrd = mappingMap.get(item);

    if (!oldSahrd) {
        smallestShard.items.add(item);
        smallestShard.addedItems++;
        mappingMap.set(item, smallestShard);
    } else if (smallestShard !== oldSahrd) {
        smallestShard.items.add(item);
        smallestShard.addedItems++;
        mappingMap.set(item, smallestShard);

        oldSahrd.items.delete(item);
        oldSahrd.removedItems++;
    }
}


for (const shard of shards.values()) {
    console.log(`shard ${shard.id}: added ${shard.addedItems}, removed ${shard.removedItems}, old count: ${shard.oldCount}, new count: ${shard.items.size}, changed: ${Math.round((shard.addedItems+shard.removedItems)/shard.oldCount*100, 2)}`);
}