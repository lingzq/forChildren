import React from 'react';
import ReactDOM from 'react-dom';
import { compose } from 'redux';
import { HashRouter, Route, Switch } from 'react-router-dom';

import AppStateHOC from '../lib/app-state-hoc.jsx';
import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import log from '../lib/log.js';
require('../myprojects/gate-config');

const onClickLogo = () => {
    window.location = 'https://scratch.mit.edu';
};

const handleTelemetryModalCancel = () => {
    log('User canceled telemetry modal');
};

const handleTelemetryModalOptIn = () => {
    log('User opted into telemetry');
};

const handleTelemetryModalOptOut = () => {
    log('User opted out of telemetry');
};
const clickFun = (id) => {
    global.constants.currentGate  = id;
    console.log('clickFun id:'+global.constants.currentGate);
    window.location = 'http://localhost:8080/#/' + id;
}

/*
 * Render the GUI playground. This is a separate function because importing anything
 * that instantiates the VM causes unsupported browsers to crash
 * {object} appTarget - the DOM element to render to
 */
export default appTarget => {
    GUI.setAppElement(appTarget);

    // note that redux's 'compose' function is just being used as a general utility to make
    // the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
    // ability to compose reducers.
    const WrappedGui = compose(
        AppStateHOC,
        HashParserHOC
    )(GUI);

    // TODO a hack for testing the backpack, allow backpack host to be set by url param
    const backpackHostMatches = window.location.href.match(/[?&]backpack_host=([^&]*)&?/);
    const backpackHost = backpackHostMatches ? backpackHostMatches[1] : null;

    const scratchDesktopMatches = window.location.href.match(/[?&]isScratchDesktop=([^&]+)/);
    let simulateScratchDesktop;
    if (scratchDesktopMatches) {
        try {
            // parse 'true' into `true`, 'false' into `false`, etc.
            simulateScratchDesktop = JSON.parse(scratchDesktopMatches[1]);
        } catch {
            // it's not JSON so just use the string
            // note that a typo like "falsy" will be treated as true
            simulateScratchDesktop = scratchDesktopMatches[1];
        }
    }

    if (process.env.NODE_ENV === 'production' && typeof window === 'object') {
        // Warn before navigating away
        window.onbeforeunload = () => true;
    }
    ReactDOM.render(
        // important: this is checking whether `simulateScratchDesktop` is truthy, not just defined!
        simulateScratchDesktop ?
            <div>
                {console.log(simulateScratchDesktop)}
                <WrappedGui
                    canEditTitle
                    isScratchDesktop
                    showTelemetryModal
                    canSave={false}
                    onTelemetryModalCancel={handleTelemetryModalCancel}
                    onTelemetryModalOptIn={handleTelemetryModalOptIn}
                    onTelemetryModalOptOut={handleTelemetryModalOptOut}
                />
            </div>
            :
            <div>
                {console.log(simulateScratchDesktop)}
                {/* <WrappedGui
                    canEditTitle
                    backpackVisible
                    showComingSoon
                    backpackHost={backpackHost}
                    canSave={false}
                    onClickLogo={onClickLogo}
                /> */}
                <HashRouter>
                    <Switch>
                        <Route exact path="/gate1" component={() => <WrappedGui />} />
                        <Route exact path="/gate2" component={() => <WrappedGui />} />
                    </Switch>
                </HashRouter>
                <button onClick={() => clickFun('gate1')}>第一关</button>
                <button onClick={() => clickFun('gate2')}>第二关</button>
            </div>
        ,
        appTarget);
};
