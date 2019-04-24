/// app.js
import React, { Component } from 'react';
import MapGL, { FlyToInterpolator } from 'react-map-gl';
import DeckGL, { GeoJsonLayer } from 'deck.gl';


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

  getLayers() {
    const points = new GeoJsonLayer({
      id: 'geo-json',
      getLineColor: d => [72, 1, 255],
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
      pointRadiusMinPixels: 5
      // onHover: ({object}) => alert(`${object.venue}`)
    });

    return [points];
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
          mapStyle='mapbox://styles/mathisonian/cjurw8owq15tb1fomkfgdvycn'
          // dragRotate={false}
          // scrollZoom={false}
          onViewportChange={this._onChangeViewport.bind(this)}
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        >
          <DeckGL
            {...viewport} /*{...tweenedViewport}*/
            layers={this.getLayers()}
            onWebGLInitialized={this._initialize.bind(this)}
          />
        </MapGL>
      </div>
    );
  }
}

module.exports = App;
