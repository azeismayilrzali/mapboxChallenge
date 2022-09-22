import { useState, useRef, useEffect } from 'react';
import './App.css'
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as turf from '@turf/turf'
import { db } from './firebase';
import { uid } from 'uid';
import { set, ref, onValue, remove, update } from "firebase/database"

function App() {
  const mapRef = useRef(null);

  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true
    },
    defaultMode: 'draw_polygon'
  });
  
  function initMapboxGLJS() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWxpbWlyemF5ZWYiLCJhIjoiY2w4Y25vYTk5MG5kczNvcGN3NnhwZnJyNSJ9.usDar3ctZeObYcy5jes_4w';

    const map = new mapboxgl.Map({
      container: 'map',
      projection: 'globe',
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [49.860, 40.370],
      zoom: 10
    });

    map.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
      })
    );

    const marker1 = new mapboxgl.Marker({ color: 'red' })
      .setLngLat([49.870, 40.38770])
      .addTo(map);

    map.addControl(draw);

    map.on('draw.create', updateArea);
    map.on('draw.delete', updateArea);
    map.on('draw.update', updateArea);
    

    function updateArea(e) {
      const drawData = draw.getAll();
      const calculatedArea = document.getElementById('calculated-area');
      if (e.type == "draw.create") {
        const uuid = uid();
        const postDrawData = e.features[0];
        set(ref(db, `/${uuid}`), {
          postDrawData,
          uuid
        })
      }
      if (e.type == "draw.delete") {
        onValue(ref(db), (snapshot) => {
          const data = snapshot.val();
          if (data) {
            Object.values(data).map(async dataDraw => {
              if (dataDraw.postDrawData.geometry.coordinates[0][0][0] == e.features[0].geometry.coordinates[0][0]) {
                remove(ref(db, `/${dataDraw.uuid}`));
              }
            })
          }
        })
      } 
      if (e.type == "draw.update") {
        const postDrawData = e.features[0];
        onValue(ref(db), (snapshot) => {
          const data = snapshot.val();
          if (data) {
            Object.values(data).map(dataDraw => {
              if (dataDraw.postDrawData.id == e.features[0].id) {
                const updateUuid = dataDraw.uuid;
                update(ref(db, `/${updateUuid}`), {
                  postDrawData,
                  uuid: updateUuid
                });
              }
            })
          }
        })
      }
      if (drawData.features.length > 0) {
        const area = turf.area(drawData);
        const rounded_area = Math.round(area * 100) / 100;
        calculatedArea.innerHTML = `<p><strong>${rounded_area}</strong></p><p>square meters</p>`;
      } else {
        calculatedArea.innerHTML = '';
        if (e.type !== 'draw.delete')
          alert('Click the map to draw a polygon.');
      }
    }
  }

  useEffect(() => {
    initMapboxGLJS()
  }, [mapRef,db])

  useEffect(() => {
    onValue(ref(db), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const firebaseDataKeys = Object.keys(data);
        firebaseDataKeys.forEach((key) => {
          draw.add({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: data[key].postDrawData.geometry.coordinates[0]
            }
          });
        });
      }
    })
  }, [])

  return (
    <>
      <div ref={mapRef} id='map'></div>
      <div className="calculation-box">
        <p>Click the map to draw a polygon.</p>
        <div id="calculated-area"></div>
      </div>
    </>
  );
}

export default App;