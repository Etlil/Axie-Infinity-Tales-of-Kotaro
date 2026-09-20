import {TOWN_SIZE,TOWN_TILE} from './townLayout';
export function addTownArtwork(scene){
 scene.cameras.main.setBackgroundColor('#657e46');
 // Continue the southern road below the playable map. Extra camera room keeps
 // a newly arrived character above the phone controls instead of at the edge.
 scene.add.image(0,TOWN_SIZE.height*TOWN_TILE,'approach-path').setOrigin(0).setDisplaySize(TOWN_SIZE.width*TOWN_TILE,TOWN_SIZE.width*TOWN_TILE*1091/1200);
 scene.add.image(0,0,'atia-official').setOrigin(0).setDisplaySize(TOWN_SIZE.width*TOWN_TILE,TOWN_SIZE.height*TOWN_TILE);
 scene.cameras.main.setBounds(0,0,TOWN_SIZE.width*TOWN_TILE,TOWN_SIZE.height*TOWN_TILE+400);
}
