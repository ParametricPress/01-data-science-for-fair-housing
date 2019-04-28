/// app.js
import React, { Component } from 'react';
import MapGL, { FlyToInterpolator } from 'react-map-gl';
import DeckGL, { GeoJsonLayer, TextLayer } from 'deck.gl';


// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoibWF0aGlzb25pYW4iLCJhIjoiY2l5bTA5aWlnMDAwMDN1cGZ6Y3d4dGl6MSJ9.JZaRAfZOZfAnU2EAuybfsg';

let initialViewport;

class App extends Component {
  constructor(props) {
    super(props);

    this.getViewport = v => {
      let vp = Object.assign({}, asiaVP);
      if (this.props.isMobile) {
        vp.zoom = vp.zoom - 1;
      }
      return vp;
    };

    initialViewport = Object.assign({
      latitude: 0,
      longitude: 0,
      zoom: 1,
      maxZoom: 16,
      pitch: 0,
      bearing: 0,
      transitionDuration: 5000,
      transitionInterpolator: new FlyToInterpolator()
    }, this.props.initialViewport);

    this.state = {
      viewport: initialViewport,
      initialized: false,
      transitioning: false
    };
  }

  _resize() {
    this._onChangeViewport({
      width: window.innerWidth,
      height: window.innerHeight * (2/3)
    });
  }

  _onChangeViewport(viewport) {
    this.setState({
      viewport: Object.assign({}, this.state.viewport, viewport)
    });
  }

  componentDidMount() {
    if (!this.ref) {
      return;
    }
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _renderTooltip() {
    const { hoveredObject, pointerX, pointerY } = this.state || {};
    return hoveredObject && (
      <div style={{ position: 'absolute', zIndex: 1, pointerEvents: 'none', left: pointerX, top: pointerY }}>
        {hoveredObject.message}
      </div>
    );
  }

  getLayers(mapID) {

    if (mapID === 'homes') {
      const pointsHomes = new GeoJsonLayer({
        id: 'geo-json',
        getLineColor: d => [255, 229, 51],
        getLineWidth: 10,
        opacity: 1,
        stroked: true,
        filled: false,
        data: this.props.geoJSON,
        pickable: false,
        color: d => [255, 229, 51],
        getFillColor: d => {
          
          // "0" eligible
          // "1" not eligible
          if (d.properties.eligible === '1') {
            // parmetric purple [72, 1, 255]
            // parametric green [93, 163, 145]
            return [255, 229, 51];
          } else {
            return [255, 229, 51];
          }
        },
        // radiusScale: 10000,
        getRadius: 2,
        radiusMinPixels: 2,
        pointRadiusMinPixels: 2
      });

      return [pointsHomes]; 
    }


    if (mapID === 'beltline') {
      const beltline = new GeoJsonLayer({
        id: 'geo-json',
        getLineColor: d => [255, 229, 51],
        getLineWidth: 9,
        opacity: 0.5,
        stroked: true,
        filled: true,
        data: this.props.geoJSON,
        pickable: false,
        color: d => [255, 229, 51],
        getFillColor: d => [255, 229, 51],
      });

      return [beltline];
    }

    if (mapID === 'apts') {
      const pointsApts = new GeoJsonLayer({
        id: 'geo-json',
        getLineWidth: 14,
        opacity: 1,
        stroked: true,
        filled: false,
        data: this.props.geoJSON,
        pickable: false,
        color: d => [255, 229, 51],
        getFillColor: d => [255, 229, 51],
        // radiusScale: 10000,
        getRadius: 5,
        radiusMinPixels: 5,
        pointRadiusMinPixels: 5,
        // onHover: ({object}) => alert(`${object.venue}`)
        onHover: info => this.setState({
          hoveredObject: info.object,
          pointerX: info.x,
          pointerY: info.y
        })
        // onHover: ({ object, x, y }) => {
        //   const tooltip = `${object.name}\n${x}`;
        //   /* Update tooltip
        //      http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
        //   */
        // }
      });

      const labels = new TextLayer({
        id: 'text-layer',
        data: this.props.geoJSON.features,
        pickable: true,
        getPosition: d => d.geometry.coordinates,
        getText: d => d.properties['apt_name'],
        getSize: 36,
        getAngle: 0,
        getTextAnchor: 'start',
        getAlignmentBaseline: 'center',
        getColor: d => [255, 255, 255],
        getPixelOffset: [40, 0],
      });

      return [pointsApts, labels];
    }

    
  }

  _initialize(gl) {
    // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE);
    // gl.blendEquation(gl.FUNC_ADD);
    // this.props.updateProps({ stepperIndex: this.props.stepperIndex + 1  });
    this.props.updateProps({ isLoaded: true });
  }

  handleRef(_ref) {
    if (!_ref) {
      return;
    }
    this.ref = _ref;
    // this._resize();
  }

  render() {
    const { viewport, initialized, transitioning } = this.state;

    return (
      <div key={'map'} ref={this.handleRef.bind(this)} style={{width: '100%'}}>
        <MapGL
          {...viewport}
          // {...tweenedViewport}
          onClick={() => this.props.updateProps({ zoomEnabled: !this.props.zoomEnabled })}
          mapStyle='mapbox://styles/mathisonian/cjurw8owq15tb1fomkfgdvycn'
          dragRotate={this.props.zoomEnabled}
          scrollZoom={this.props.zoomEnabled}
          onViewportChange={this._onChangeViewport.bind(this)}
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        >
          <DeckGL
            {...viewport} /*{...tweenedViewport}*/
            layers={this.getLayers(this.props.map)}
            onWebGLInitialized={this._initialize.bind(this)}
            /*{this._renderTooltip()}*/
          />
        </MapGL>
      </div>
    );
  }
}

module.exports = App;
