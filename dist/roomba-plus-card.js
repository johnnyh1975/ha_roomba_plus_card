function ge(t,n,e,r,o){let a=d=>!!t.states[`sensor.${n}_${d}`],s=d=>!!t.states[`select.${n}_${d}`],l=d=>!!t.states[`binary_sensor.${n}_${d}`],i=d=>!!t.states[`image.${n}_${d}`],c=a("mop_pad"),p=a("brush_remaining_hours");return{hasArea:a("area_cleaned_today"),hasBrush:p,hasPad:c,hasWater:a("mop_tank_level"),hasCleanBase:a("clean_base_status"),hasZones:s("smart_zone_select")||s("zone_select"),hasSmartZones:s("smart_zone_select"),hasProblemZone:a("problem_zone"),hasLifetimeArea:a("cleaning_analytics_30d"),hasWearRate:a("filter_wear_rate"),isMop:c&&!p,hasMissionActive:l("mission_active"),hasMissionPhase:a("phase"),hasCleaningSpeedTrend:a("cleaning_performance"),hasBatteryRetention:a("battery_capacity_retention"),hasWifiFloor:a("wifi_health"),hasCoveragePct:a("recent_coverage_pct"),hasBatteryEol:a("estimated_battery_eol"),hasConsecutiveSkips:a("consecutive_clean_skips"),hasMopBehavior:a("mop_behavior"),hasCoverageImage:i("coverage_map"),hasWifiSignal:r?.wifi_signal!=null,hasRoomCoverage:r!=null&&"room_coverage"in r,hasDirtDensity:o!=null&&"dirt_density"in o,hasRobotSelectorHelper:!!e.robot_selector_helper&&!!t.states[e.robot_selector_helper],hasCleanedRooms:Array.isArray(t.states[`vacuum.${n}`]?.attributes?.last_cleaned_rooms)&&(t.states[`vacuum.${n}`]?.attributes?.last_cleaned_rooms).length>0,hasDemandBlocked:l("demand_clean_blocked"),hasEnergyConsumption:a("total_energy_consumed"),hasOptimalWindow:a("optimal_clean_window"),hasRobotHealthScore:a("robot_health_score"),hasMaintenanceCalendar:a("wheel_last_cleaned")||a("contact_last_cleaned")||a("bin_last_cleaned"),hasMissionProgressSensor:a("mission_progress"),hasAlignment:(()=>{let d=t.states[`image.${n}_coverage_map`]?.attributes?.rooms;return!!d&&typeof d=="object"&&Object.keys(d).length>0})(),hasFavorites:Object.keys(t.states).some(d=>d.startsWith(`button.${n}_fav_`))}}var de=class{constructor(n,e,r){this.hass=n;this.entryId=null;this.entityId=r??e.entity}updateHass(n){this.hass=n}async fetchSummary(n){let r=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=summary&days=${n}`,o=await this.hass.fetchWithAuth(r);if(!o.ok)throw new Error(`${o.status}`);return o.json()}async fetchRecords(n){let r=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=records&days=${n}`,o=await this.hass.fetchWithAuth(r);return o.ok?o.json():[]}async resolveEntryId(){if(this.entryId)return this.entryId;let n=await this.hass.callWS({type:"config/entity_registry/get",entity_id:this.entityId});return this.entryId=n.config_entry_id,this.entryId}async fetchHazards(){let e=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=hazards`,r=await this.hass.fetchWithAuth(e);return r.ok?r.json():[]}async fetchHousehold(n){let e=`/api/roomba_plus/household?days=${n}`,r=await this.hass.fetchWithAuth(e);return r.ok?r.json():null}};function b(t){return String(t??"").replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n]??n)}function G(t,n="en"){let e=Date.now()-new Date(t).getTime(),r=Math.floor(e/6e4);try{let o=new Intl.RelativeTimeFormat(n,{numeric:"auto"});if(r<1)return o.format(0,"minute");if(r<60)return o.format(-r,"minute");let a=Math.floor(r/60);if(a<24)return o.format(-a,"hour");let s=Math.floor(a/24);return s<30?o.format(-s,"day"):o.format(-Math.floor(s/30),"month")}catch{if(r<1)return"just now";if(r<60)return`${r}m ago`;let o=Math.floor(r/60);return o<24?`${o}h ago`:`${Math.floor(o/24)}d ago`}}var re={sofa:"\u{1F6CB}\uFE0F",bed:"\u{1F6CF}\uFE0F","bed-double":"\u{1F6CF}\uFE0F","silverware-fork-knife":"\u{1F37D}\uFE0F",stove:"\u{1F373}",microwave:"\u{1F4E6}",fridge:"\u{1F9CA}",toilet:"\u{1F6BD}",shower:"\u{1F6BF}",bathtub:"\u{1F6C1}",desk:"\u{1F5A5}\uFE0F","chair-rolling":"\u{1F4BA}",television:"\u{1F4FA}",bookshelf:"\u{1F4DA}",wardrobe:"\u{1F454}",home:"\u{1F3E0}",garage:"\u{1F697}",door:"\u{1F6AA}",stairs:"\u{1FA9C}",balcony:"\u{1F305}",pool:"\u{1F3CA}","washing-machine":"\u{1FAE7}",hanger:"\u{1F9F9}","baby-carriage":"\u{1F37C}",dog:"\u{1F415}",cat:"\u{1F408}","floor-plan":"\u{1F4D0}","map-marker":"\u{1F4CD}",star:"\u2B50",heart:"\u2764\uFE0F","office-building":"\u{1F3E2}",school:"\u{1F3EB}"},Ce="\u{1F4CD}";var be={Auto:"Auto","\xD71":"One pass","\xD72":"Two passes"},Te={Auto:"Auto","One pass":"\xD71","Two passes":"\xD72"};function fe(t,n,e,r,o=!1){if(n.show_settings===!1)return"";let a=e,s=t.states[`switch.${a}_edge_clean`],l=t.states[`switch.${a}_always_finish`],i=t.states[`select.${a}_carpet_boost_select`];if(!s&&!l&&!i)return"";let c="";if(r){let g=s?.state==="on",y=l?.state==="on",k=i?i.attributes.options??[]:[];c=`
      <div class="rpc-settings-panel">
        ${s?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Edge clean</span>
            <button class="rpc-setting-toggle${g?" rpc-setting-on":""}"
                    data-switch-entity="switch.${a}_edge_clean"
                    aria-pressed="${g}">
              ${g?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${l?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Always finish</span>
            <button class="rpc-setting-toggle${y?" rpc-setting-on":""}"
                    data-switch-entity="switch.${a}_always_finish"
                    aria-pressed="${y}">
              ${y?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${i?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Carpet boost</span>
            <button class="rpc-setting-cycle"
                    data-cycle-entity="select.${a}_carpet_boost_select"
                    data-cycle-options="${b(JSON.stringify(k))}"
                    data-cycle-current="${b(i.state)}">
              ${b(i.state)} \u25BC
            </button>
          </div>`:""}
      </div>
    `}return`
    ${o?'<div class="rpc-settings-divider rpc-settings-divider--compact"></div>':'<div class="rpc-settings-divider"></div>'}
    ${o?'<div class="rpc-zone-header rpc-controls-label">CONTROLS</div>':""}
    <button class="rpc-settings-row" data-settings-toggle aria-expanded="${r}">
      <span class="rpc-settings-icon">\u2699</span>
      <span class="rpc-settings-label">Settings</span>
      <span class="rpc-settings-arrow">${r?"\u25B2":"\u25BC"}</span>
    </button>
    ${c}
  `}function ve(t){let{hass:n,config:e,caps:r,robotName:o,selectedRooms:a,passes:s,isSending:l,sendError:i,settingsPanelOpen:c,includeSettingsPanel:p=!0}=t;if(!r.hasSmartZones||e.show_rooms===!1)return"";let d=o,g=n.states[`select.${d}_smart_zone_select`];if(!g)return"";let y=g.attributes.options??[];if(y.length===0)return"";let k=n.states[`button.${d}_repeat_mission`],h=!!k&&k.state!=="unavailable",u=n.states[`select.${d}_cleaning_passes`],$=r.isMop?"\u25B6 Mop selected rooms":"\u25B6 Clean selected rooms",_=a.size,S='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',C=(()=>{let L=r.hasSmartZones?`select.${o}_smart_zone_select`:`select.${o}_zone_select`,R=n.states[L]?.attributes?.region_icons;return R&&typeof R=="object"&&!Array.isArray(R)?R:{}})(),H=y.map(L=>{let R=a.has(L),U=C[L],Y=U?re[U]??Ce:"",K=Y?`${Y} ${b(L)}`:b(L);return`<button class="rpc-room-chip${R?" rpc-room-chip--selected":""}"
      data-room="${b(L)}" aria-pressed="${R}">${K}</button>`}).join(""),T="";if(u){let L=s;T=`
      <div class="rpc-passes-row">
        <span class="rpc-passes-label">Passes:</span>
        ${["Auto","\xD71","\xD72"].map(R=>`<button class="rpc-pass-chip${L===R?" rpc-pass-chip--selected":""}"
            data-pass="${R}"
            data-pass-option="${b(be[R]??R)}">${R}</button>`).join("")}
      </div>
    `}let z=p?fe(n,e,o,c):"";return`
    <div class="rpc-zone rpc-zone2">
      <div class="rpc-zone-header">ROOMS</div>
      <div class="rpc-chips-row">
        ${H}
        ${_>0?`<span class="rpc-selected-count">${_} selected</span>`:""}
      </div>
      ${T}
      <div class="rpc-room-actions">
        <button class="rpc-btn rpc-btn-primary${_===0||l?" rpc-btn-disabled":""}"
                data-action="clean-selected"
                ${_===0||l?"disabled":""}
                aria-label="${$}">
          ${l?S+" Sending\u2026":$}
        </button>
        ${h?'<button class="rpc-btn-text" data-action="repeat-last">\u21A9 Repeat last</button>':""}
      </div>
      ${i?`<div class="rpc-send-error">${b(i)}</div>`:""}
      ${z}
    </div>
  `}function Ee(t,n){return Math.min(100,Math.max(0,Math.round(t/n*100)))}function He(t,n){return n==="battery"?t>20?"var(--rpc-green)":t>10?"var(--rpc-amber)":"var(--rpc-red)":n==="tank"?t>40?"var(--rpc-green)":t>20?"var(--rpc-amber)":"var(--rpc-red)":t>50?"var(--rpc-green)":t>10?"var(--rpc-amber)":"var(--rpc-red)"}function st(t,n){let e=n/90;if(!e)return"";let r=t/e;return r>1.2?"\u2191":r<.8?"\u2193":"\u2192"}function Re(t){let n=parseInt(t,10);return!isNaN(n)&&n>=0?`~${n} use${n!==1?"s":""} remaining`:t==="Empty"?"Bag full \u2014 replace soon":t==="Full"?"Bag has capacity":b(t)}function at(t){return t>=80?"var(--rpc-green)":t>=60?"var(--rpc-amber)":"var(--rpc-red)"}function ot(t){return t>=80?"GOOD":t>=60?"FAIR":"NEEDS ATTENTION"}function nt(t,n,e,r){if(!n.hasRobotHealthScore)return"";let o=t.states[`sensor.${e}_robot_health_score`];if(!o)return"";if(o.state==="unknown"||o.state==="unavailable")return`
      <div class="rpc-health-score rpc-health-score--calibrating">
        <span class="rpc-health-score-label">ROBOT HEALTH</span>
        <span class="rpc-health-score-calibrating">Calibrating\u2026 (needs more mission history)</span>
      </div>
      <button class="rpc-health-details-toggle" data-health-details-toggle aria-expanded="${r}">
        ${r?"Hide details \u25B2":"Show details \u25BC"}
      </button>
    `;let s=Math.round(parseFloat(o.state));if(isNaN(s))return"";let l=at(s),i=ot(s);return`
    <div class="rpc-health-score" aria-label="Robot health ${s} out of 100, ${i}">
      <span class="rpc-health-score-label">ROBOT HEALTH</span>
      <span class="rpc-health-score-value" style="color:${l}">${s}</span>
      <span class="rpc-health-score-band" style="color:${l}">\u25CF ${i}</span>
    </div>
    <button class="rpc-health-details-toggle" data-health-details-toggle aria-expanded="${r}">
      ${r?"Hide details \u25B2":"Show details \u25BC"}
    </button>
  `}function it(t,n){let r=t.states[`sensor.${n}_last_mission_result`]?.attributes?.consecutive_anomalous;return typeof r!="number"||r<2?"":`
    <div class="rpc-anomaly-banner" role="alert">
      \u26A0 Last ${r} missions were anomalous \u2014 check brushes and filter
    </div>
  `}function lt(t,n,e,r){if(!n.hasMaintenanceCalendar)return"";let o=[{key:"wheel",label:"Wheels",entityId:`sensor.${e}_wheel_last_cleaned`,service:"roomba_plus.reset_wheel_cleaning"},{key:"contact",label:"Contacts",entityId:`sensor.${e}_contact_last_cleaned`,service:"roomba_plus.reset_contact_cleaning"},{key:"bin",label:"Bin",entityId:`sensor.${e}_bin_last_cleaned`,service:"roomba_plus.reset_bin_cleaning"}].filter(s=>!!t.states[s.entityId]);return o.length===0?"":`
    <div class="rpc-maint-divider"></div>
    <div class="rpc-maint-header">Other maintenance</div>
    ${o.map(s=>{let l=t.states[s.entityId],i=r.openMaintPopover===s.key,p=l.state!=="unavailable"&&l.state!=="unknown"?`Cleaned ${G(l.state,t.language)}`:"Never recorded";return`
      <div class="rpc-maint-row" data-maint="${s.key}" role="button" aria-expanded="${i}" tabindex="0"
           aria-label="${s.label} \u2014 ${p}">
        <span class="rpc-maint-label">${s.label}</span>
        <span class="rpc-maint-val">${p}</span>
      </div>
      ${i?`
        <div class="rpc-popover">
          <div class="rpc-popover-header">
            <span>${s.label}</span>
            <button class="rpc-popover-close" data-close-maint="${s.key}" aria-label="Close">\xD7</button>
          </div>
          <div class="rpc-popover-divider"></div>
          <div class="rpc-popover-sub">Reset via Developer Tools \u2192 Services:</div>
          <div class="rpc-maint-service">${s.service}</div>
        </div>
      `:""}
    `}).join("")}
  `}function Me(t,n,e,r,o){if(n.show_health===!1)return"";let a=r,s=[];t.states[`sensor.${a}_filter_remaining_hours`]&&s.push({key:"filter",label:"Filter",sensorId:`sensor.${a}_filter_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:e.hasWearRate?`sensor.${a}_filter_wear_rate`:void 0,resetService:"reset_filter",lastReplacedId:`sensor.${a}_filter_last_replaced`}),e.hasBrush&&t.states[`sensor.${a}_brush_remaining_hours`]&&s.push({key:"brush",label:"Brush",sensorId:`sensor.${a}_brush_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:e.hasWearRate?`sensor.${a}_brush_wear_rate`:void 0,resetService:"reset_brush",lastReplacedId:`sensor.${a}_brush_last_replaced`}),e.hasPad&&t.states[`sensor.${a}_pad_days_until_due`]&&s.push({key:"pad",label:"Pad",sensorId:`sensor.${a}_pad_days_until_due`,thresholdAttr:"threshold_days",type:"consumable",unit:"d",wearSensorId:e.hasWearRate?`sensor.${a}_pad_wear_rate`:void 0,resetService:"reset_pad",lastReplacedId:`sensor.${a}_pad_last_replaced`}),e.hasWater&&t.states[`sensor.${a}_mop_tank_level`]&&s.push({key:"tank",label:"Tank",sensorId:`sensor.${a}_mop_tank_level`,thresholdAttr:null,type:"tank"});let l=t.states[`sensor.${a}_battery`]?`sensor.${a}_battery`:null,i=l?void 0:t.states[`vacuum.${a}`]?.attributes?.battery_level;(l||i!==void 0)&&s.push({key:"battery",label:"Battery",sensorId:l??"",thresholdAttr:null,type:"battery",rawPct:i}),e.hasCleanBase&&t.states[`sensor.${a}_clean_base_status`]&&s.push({key:"cleanbase",label:"Clean Base",sensorId:`sensor.${a}_clean_base_status`,thresholdAttr:null,type:"cleanbase"});let c=it(t,a);if(s.length===0&&!e.hasRobotHealthScore&&!e.hasMaintenanceCalendar&&!c&&!e.hasBatteryRetention&&!e.hasCoveragePct)return"";let p=s.map(u=>ct(u,t,a,o)).join(""),d="";if(e.hasBatteryRetention){let u=t.states[`sensor.${a}_battery_capacity_retention`];if(u&&u.state!=="unavailable"&&u.state!=="unknown"){let v=Math.round(parseFloat(u.state));if(!isNaN(v)){let $=v>85?"var(--rpc-green)":v>70?"var(--rpc-amber)":"var(--rpc-red)",_=t.states[`sensor.${a}_battery_cycles`],S=_?parseInt(_.state,10):NaN,C=isNaN(S)?"":`${S} charge cycle${S!==1?"s":""}`,H="";if(e.hasBatteryEol){let U=t.states[`sensor.${a}_estimated_battery_eol`];if(U&&U.state!=="unavailable"&&U.state!=="unknown"){let Y=parseInt(U.state,10);isNaN(Y)||(H=Y>0?`<div class="rpc-retention-eol">Battery life: ~${Y} days remaining</div>`:'<div class="rpc-retention-eol rpc-retention-eol--warn">Consider replacing \u2014 battery at end of life</div>')}}let T=o.openPopover==="retention",z=o.resetting==="retention",R=T?`
          <div class="rpc-popover">
            <div class="rpc-popover-header">
              <span>Battery Health</span>
              <button class="rpc-popover-close" data-close="retention" aria-label="Close">\xD7</button>
            </div>
            <div class="rpc-popover-divider"></div>
            <div class="rpc-popover-body">
              <div>${v}% of original capacity</div>
              ${C?`<div class="rpc-popover-sub">${C}</div>`:""}
              ${H}
            </div>
            <button class="rpc-btn rpc-btn-secondary${z?" rpc-btn-loading":""}"
                    data-reset="retention" data-service="reset_battery"
                    ${z?"disabled":""}>
              ${z?'<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':"Mark as replaced"}
            </button>
            ${o.resetError==="retention"?'<div class="rpc-send-error">Reset failed \u2014 try again</div>':""}
          </div>`:"";d=`
          <div class="rpc-bar-row" data-bar="retention" role="button" aria-expanded="${T}" tabindex="0"
               aria-label="Bat. Health \u2014 ${v}%">
            <span class="rpc-bar-label">Bat. Health</span>
            <div class="rpc-bar-track"><div class="rpc-bar-fill" style="width:${v}%;background:${$}"></div></div>
            <span class="rpc-bar-pct" style="color:${$}">${v}%</span>
            <span class="rpc-bar-hours"></span>
          </div>
          ${R}`}}}let g="";if(e.hasCoveragePct){let u=t.states[`sensor.${a}_recent_coverage_pct`];if(u&&u.state!=="unavailable"&&u.state!=="unknown"){let v=t.states[`sensor.${a}_missions_last_30d`],$=v?parseInt(v.state,10):NaN;if(isNaN($)||$<10)g=`
          <div class="rpc-bar-row rpc-bar-row--static">
            <span class="rpc-bar-label">Coverage</span>
            <span class="rpc-coverage-building">Building history\u2026</span>
          </div>`;else{let _=Math.min(100,Math.round(parseFloat(u.state)));if(!isNaN(_)){let S=_>=85?"var(--rpc-green)":_>=65?"var(--rpc-amber)":"var(--rpc-red)",C=o.openPopover==="coverage",H=isNaN($)?"":`Based on ${$} mission${$!==1?"s":""} in the last 30 days.`,T=C?`
            <div class="rpc-popover">
              <div class="rpc-popover-header">
                <span>Floor Coverage</span>
                <button class="rpc-popover-close" data-close="coverage" aria-label="Close">\xD7</button>
              </div>
              <div class="rpc-popover-divider"></div>
              <div class="rpc-popover-body">
                <div>${_}% of floor area covered on the last mission.</div>
                ${H?`<div class="rpc-popover-sub">${H}</div>`:""}
                <div class="rpc-popover-sub">Low coverage may indicate obstacles, map drift, or a missed room.</div>
              </div>
            </div>`:"";g=`
            <div class="rpc-bar-row" data-bar="coverage" role="button" aria-expanded="${C}" tabindex="0"
                 aria-label="Coverage ${_}% last mission">
              <span class="rpc-bar-label">Coverage</span>
              <div class="rpc-bar-track"><div class="rpc-bar-fill" style="width:${_}%;background:${S}"></div></div>
              <span class="rpc-bar-pct" style="color:${S}">${_}%</span>
              <span class="rpc-bar-hours">last mission</span>
            </div>
            ${T}`}}}}let y=d||g?`<div class="rpc-health-battery-sep"></div>${d}${g}`:"",k="";if(e.hasEnergyConsumption){let u=t.states[`sensor.${a}_total_energy_consumed`];if(u&&u.state!=="unavailable"&&u.state!=="unknown"){let v=parseFloat(u.state);if(!isNaN(v)){let $=t.states[`sensor.${a}_battery_cycles`],_=$?parseInt($.state,10):NaN,S=o.openPopover==="energy",C=S?`
          <div class="rpc-popover">
            <div class="rpc-popover-header">
              <span>Energy</span>
              <button class="rpc-popover-close" data-close="energy" aria-label="Close">\xD7</button>
            </div>
            <div class="rpc-popover-divider"></div>
            <div class="rpc-popover-body">
              <div>~${v.toFixed(1)} kWh used${isNaN(_)?"":` over ${_} charge cycles`}</div>
              <div class="rpc-popover-sub">Estimated from battery capacity and cycle count.</div>
              <div class="rpc-popover-sub">Connect to the HA Energy dashboard for home-wide monitoring.</div>
            </div>
          </div>`:"";k=`
          <div class="rpc-bar-row" data-bar="energy" role="button" aria-expanded="${S}" tabindex="0"
               aria-label="Lifetime energy ~${v.toFixed(1)} kWh">
            <span class="rpc-bar-label">Energy</span>
            <span class="rpc-energy-val">~${v.toFixed(1)} kWh lifetime</span>
          </div>
          ${C}`}}}let h="";if(e.isMop){let u=t.states[`sensor.${a}_mop_pad`],v=e.hasMopBehavior?t.states[`sensor.${a}_mop_behavior`]:null,$=[];u&&u.state!=="unknown"&&u.state!=="unavailable"&&$.push(b(u.state)),v&&v.state!=="unknown"&&v.state!=="unavailable"&&$.push(`${b(v.state)} intensity`),$.length&&(h=`
        <div class="rpc-health-divider"></div>
        <div class="rpc-mop-config">${$.join(" \xB7 ")}</div>
      `)}return`
    <div class="rpc-zone rpc-zone3">
      <div class="rpc-zone-header">HEALTH</div>
      ${c}
      ${nt(t,e,a,o.healthDetailsExpanded)}
      ${e.hasRobotHealthScore&&!o.healthDetailsExpanded?"":`
        ${p}
        ${y}
        ${k}
        ${h}
      `}
      ${lt(t,e,a,o)}
    </div>
  `}function ct(t,n,e,r){let o=r.openPopover===t.key;if(t.type==="cleanbase"){let g=n.states[t.sensorId];return g?`
      <div class="rpc-bar-row" data-bar="${t.key}" role="button" aria-expanded="${o}" tabindex="0"
           aria-label="${t.label}">
        <span class="rpc-bar-label">${t.label}</span>
        <span class="rpc-bar-cleanbase-state">${Re(g.state)}</span>
      </div>
      ${o?dt(t.label,g.state):""}
    `:""}let a=0,s="",l="",i=null;if(t.rawPct!==void 0)a=Math.min(100,Math.max(0,t.rawPct)),s=`${Math.round(a)}%`;else{let g=n.states[t.sensorId];if(!g)return"";let y=parseFloat(g.state);if(isNaN(y))return"";if(t.type==="tank"||t.type==="battery")a=Math.min(100,Math.max(0,y)),s=`${Math.round(a)}%`;else{if(i=t.thresholdAttr?g.attributes[t.thresholdAttr]:null,!i)return"";a=Ee(y,i),s=`${a}%`,l=`${Math.round(y)}h`}}let c=He(a,t.type),p="";if(t.wearSensorId&&i){let g=n.states[t.wearSensorId];g&&g.state!=="unknown"&&g.state!=="unavailable"&&(p=st(parseFloat(g.state),i))}let d=t.rawPct!==void 0?{state:String(Math.round(t.rawPct)),attributes:{}}:n.states[t.sensorId];return`
    <div class="rpc-bar-row" data-bar="${t.key}" role="button" aria-expanded="${o}" tabindex="0"
         aria-label="${t.label} \u2014 ${s}">
      <span class="rpc-bar-label">${t.label}</span>
      <div class="rpc-bar-track">
        <div class="rpc-bar-fill" style="width:${a}%;background:${c}"></div>
      </div>
      <span class="rpc-bar-pct" style="color:${c}">${s}</span>
      ${l?`<span class="rpc-bar-hours">${l}</span>`:""}
      ${p?`<span class="rpc-bar-arrow" style="color:${c}">${p}</span>`:""}
    </div>
    ${o&&d?pt(t,d,i,n,r):""}
  `}function pt(t,n,e,r,o){let a=parseFloat(n.state),s=e?Ee(a,e):Math.min(100,Math.max(0,a)),l=He(s,t.type),i=o.resetting===t.key,c=t.lastReplacedId?r.states[t.lastReplacedId]:null,p="";c&&c.state!=="unavailable"&&c.state!=="unknown"&&(p=`
      <div class="rpc-popover-row">
        <span>Last replaced</span>
        <span>${new Date(c.state).toLocaleDateString(r.language)} (${G(c.state,r.language)})</span>
      </div>`);let d="";if(t.wearSensorId&&!o.legendShown){let y=r.states[t.wearSensorId];y&&y.state!=="unknown"&&y.state!=="unavailable"&&(d=`
        <div class="rpc-wear-legend" data-wear-legend>
          <span class="rpc-wear-legend-title">Wear trend</span>
          <span>\u2191 wearing faster than normal</span>
          <span>\u2192 wearing at normal rate</span>
          <span>\u2193 wearing slower than normal</span>
        </div>`)}return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${b(t.label)}</span>
        <button class="rpc-popover-close" data-close="${t.key}" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      ${p}
      ${e?`<div class="rpc-popover-row"><span>Threshold</span><span>${e} ${t.unit??"h"}</span></div>`:""}
      ${e?`<div class="rpc-popover-row"><span>Remaining</span><span>${Math.round(a)} ${t.unit??"h"} (${s}%)</span></div>`:""}
      <div class="rpc-popover-bar-track">
        <div class="rpc-popover-bar-fill" style="width:${s}%;background:${l}"></div>
      </div>
      ${d}
      ${t.resetService?`
        <button class="rpc-btn rpc-btn-secondary${i?" rpc-btn-loading":""}"
                data-reset="${t.key}" data-service="${t.resetService}"
                ${i?"disabled":""}>
          ${i?'<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':"Mark as replaced"}
        </button>
        ${o.resetError===t.key?'<div class="rpc-send-error">Reset failed \u2014 try again</div>':""}
      `:""}
    </div>
  `}function dt(t,n){return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${b(t)}</span>
        <button class="rpc-popover-close" data-close="cleanbase" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      <div class="rpc-popover-row"><span>Status</span><span>${Re(n)}</span></div>
      <div class="rpc-popover-row"><span>Function</span><span>Auto-empties bin after missions</span></div>
    </div>
  `}function ze(t,n){if(!t||t==="unavailable"||t==="unknown")return"No schedule set";try{let e=new Date(t);return e.toLocaleDateString(n,{weekday:"short"})+" "+e.toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return b(t)}}function ut(t,n){if(!t||t==="unavailable"||t==="unknown")return"";try{let e=new Date(t);if(isNaN(e.getTime()))return"";let r=e.toLocaleDateString(n,{weekday:"short"}),o=e.toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit",hour12:!1});return`${r} ~${o}`}catch{return""}}function Ae(t,n,e,r,o){if(n.show_schedule===!1)return"";let a=r,s=t.states[`sensor.${a}_next_clean`],l=t.states[`binary_sensor.${a}_schedule_hold_active`],i=t.states[`sensor.${a}_presence_clean_opportunities_7d`],c=t.states[`sensor.${a}_presence_clean_utilisation_7d`],p=t.states[`sensor.${a}_next_likely_clean_window`],d=!!i&&!!c&&i.state!=="unknown"&&i.state!=="unavailable"&&c.state!=="unknown"&&c.state!=="unavailable",g=!!p&&p.state!=="unknown"&&p.state!=="unavailable";if(!s&&!l&&!d&&!g&&!e.hasOptimalWindow)return"";let y="";if(l){let _=l.state==="on",C=l.attributes.source==="presence_manager",H="rpc-badge-green",T="Schedule active",z="";_&&(C?(H="rpc-badge-blue",T="Away hold",z="\u{1F3C3}"):(H="rpc-badge-amber",T="Hold active",z="\u{1F512}")),y=`
      <button class="rpc-hold-badge ${H}"
              data-hold-action="${C?"tooltip":"toggle"}"
              aria-label="${b(T)}">
        ${o.holdToggling?'<svg class="rpc-spinner rpc-spinner-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':`${z} ${T}`}
      </button>
      ${o.holdTooltipVisible?`
        <div class="rpc-hold-tooltip" role="status">
          Schedule managed by presence automation \u2014 controlled automatically
        </div>`:""}
    `}let k="";if(g){let _=ut(p.state,t.language);_&&(k=`
        <div class="rpc-next-clean rpc-next-clean--likely">
          <span class="rpc-schedule-label">Next likely window</span>
          <span class="rpc-schedule-time rpc-schedule-time--approx">${_}</span>
        </div>
      `)}let h="";if(e.hasOptimalWindow){let _=t.states[`sensor.${a}_optimal_clean_window`];if(_&&_.state!=="unavailable"&&_.state!=="unknown"){let S=ze(_.state,t.language);S&&S!=="No schedule set"&&(h=`
          <div class="rpc-next-clean rpc-next-clean--optimal">
            <span class="rpc-schedule-label">Optimal window</span>
            <span class="rpc-schedule-time">
              ${S}
              <span class="rpc-optimal-star" title="Analytically derived from cleaning history">\u2605</span>
            </span>
          </div>`)}}let u="",v=n.presence_entities??[];if(v.length>0){let _=v.map(S=>{let C=t.states[S];if(!C)return"";let H=C.state==="home",T=C.attributes.friendly_name??S,z=b(T.split(" ")[0]);return`<span class="rpc-presence-dot">
        <span class="rpc-dot ${H?"rpc-dot-amber":"rpc-dot-green"}" aria-hidden="true"></span>
        ${z}
        <span class="rpc-presence-label">${H?"home":"away"}</span>
      </span>`}).join("");_&&(u=`<div class="rpc-presence-row">${_}</div>`)}let $="";if(d){let _=parseInt(i.state,10),S=parseInt(c.state,10);if(!isNaN(_)&&!isNaN(S)){let C=c.attributes.cleans_7d,H=C??Math.round(_*S/100),T=`${_} opportunit${_!==1?"ies":"y"} this week`;$=`
        <div class="rpc-presence-analytics" aria-label="Presence cleaning analytics">
          ${`${H} clean${H!==1?"s":""}`} \xB7 ${T}
        </div>
      `}}return`
    <div class="rpc-zone rpc-zone4">
      <div class="rpc-zone-header">SCHEDULE &amp; PRESENCE</div>
      <div class="rpc-schedule-row">
        <div class="rpc-schedule-times">
          ${s?`
            <div class="rpc-next-clean">
              <span class="rpc-schedule-label">Next scheduled</span>
              <span class="rpc-schedule-time">${ze(s.state,t.language)}</span>
            </div>`:""}
          ${k}
          ${h}
        </div>
        ${y}
      </div>
      ${u}
      ${$}
    </div>
  `}var De={completed:"#2d9c4f",stuck:"#d97706",error:"#dc2626",cancelled:"#9ca3af",none:"var(--rpc-cell-empty, var(--rpc-grey-light, #e5e7eb))"},V=24,ye=2,le=20,_e=18,X=V+ye;function Ne(t=7){return le+t*X-ye}function Le(t){return _e+t*X-ye+4}function mt(t,n){return t.toLocaleDateString(n,{month:"short",day:"numeric"})}function Pe(t){return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}function Ie(t,n,e,r="en-US",o=!1){let a=new Map;for(let h of t)a.set(h.date,h);let s=new Date,l=new Date(s);l.setDate(s.getDate()-(n-1));let i=(l.getDay()+6)%7;l.setDate(l.getDate()-i);let c=Math.ceil((n+i)/7),p=[];for(let h=0;h<c;h++)for(let u=0;u<7;u++){let v=new Date(l);v.setDate(l.getDate()+h*7+u),!(v>s)&&p.push({date:v,summary:a.get(Pe(v))??null,col:u,row:h})}let d=Ne(),g=Le(c),y=["Mo","Tu","We","Th","Fr","Sa","Su"],k=`<svg width="${d}" height="${g}" viewBox="0 0 ${d} ${g}" xmlns="http://www.w3.org/2000/svg" role="grid" aria-label="Cleaning history heatmap">`;for(let h=0;h<7;h++){let u=le+h*X+V/2;k+=`<text x="${u}" y="13" text-anchor="middle" font-size="9" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${y[h]}</text>`}for(let h of p){let u=le+h.col*X,v=_e+h.row*X,$=h.summary?.result??"none",_=De[$]??De.none,S=h.summary?.total??0,C=mt(h.date,r);if(S===0?C+=": no missions":S===1?C+=`: 1 mission, ${$}`:C+=`: ${S} missions, ${$}`,h.col===0){let T=h.date.getDate();k+=`<text x="${le-3}" y="${v+V/2+3}" text-anchor="end" font-size="9" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${T}</text>`}let H="";if(o&&h.summary?.relative_to_baseline!=null){let T=h.summary.relative_to_baseline;H=` opacity="${Math.min(1,Math.max(.5,.5+T/4)).toFixed(2)}"`}if(k+=`<g role="gridcell" aria-label="${C}" data-date="${Pe(h.date)}" data-result="${$}" data-total="${S}" style="cursor:pointer">`,k+=`<rect x="${u-2}" y="${v-2}" width="${V+4}" height="${V+4}" fill="transparent" rx="4"/>`,k+=`<rect x="${u}" y="${v}" width="${V}" height="${V}" fill="${_}" rx="3"${H}/>`,S>1){let T=Math.min(S,3);for(let z=0;z<T;z++){let L=u+V-4-z*5,R=v+V-3;k+=`<circle cx="${L}" cy="${R}" r="2" fill="rgba(255,255,255,0.75)"/>`}}k+="</g>"}return k+="</svg>",k}function Be(t){if(!t||t.length!==5)return null;let n=t.reduce((r,o)=>r+o,0);if(n===0)return null;let e=t.reduce((r,o,a)=>r+a*o,0)/n;return Math.round(e/4*100*10)/10}function Oe(t){if(!t||t.length===0)return[];if(t.length===5){let e=t.reduce((r,o)=>r+o,0);return e===0?[0,0,0,0,0]:t.map(r=>Math.round(r/e*100))}return t.every(e=>e<=4)?t.map(e=>e*25):t}function xe(t,n,e,r,o,a){let s=((t-e)/(r-e)*100).toFixed(1)+"%",l=((a-n)/(a-o)*100).toFixed(1)+"%";return{left:s,top:l}}function Fe(t,n,e,r,o,a){let s=(t-e)/(r-e)*100,l=(a-n)/(a-o)*100;return{x:s,y:l}}function je(t){return t<=4?t*25:t}function We(t,n){if(!t||t.length===0)return"";let e=7,r=t.length<=e?[...t]:Array.from({length:e},(g,y)=>t[Math.round(y/(e-1)*(t.length-1))]),o=Math.max(...r,1),a=r.length,s=6,l=2,i=a*s+(a-1)*l,c=16,p=n>=60?"var(--rpc-green)":n>=40?"var(--rpc-amber)":"var(--rpc-red)",d="";for(let g=0;g<a;g++){let y=g*(s+l),k=Math.max(2,Math.round(r[g]/o*c)),h=c-k;d+=`<rect x="${y}" y="${h}" width="${s}" height="${k}" fill="${p}" rx="1"/>`}return`<svg width="${i}" height="${c}" viewBox="0 0 ${i} ${c}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:inline-block;vertical-align:middle;flex-shrink:0">${d}</svg>`}function qe(t=4){let n=Ne(),e=Le(t),r=["Mo","Tu","We","Th","Fr","Sa","Su"],o=`<svg width="${n}" height="${e}" viewBox="0 0 ${n} ${e}" xmlns="http://www.w3.org/2000/svg">`;o+="<style>@keyframes rpc-pulse{0%,100%{opacity:.35}50%{opacity:.7}}.rpc-skel{animation:rpc-pulse 1.5s ease-in-out infinite}</style>";for(let a=0;a<7;a++){let s=le+a*X+V/2;o+=`<text x="${s}" y="13" text-anchor="middle" font-size="9" fill="var(--secondary-text-color,#9ca3af)" font-family="inherit">${r[a]}</text>`}for(let a=0;a<t;a++)for(let s=0;s<7;s++){let l=le+s*X,i=_e+a*X;o+=`<rect x="${l}" y="${i}" width="${V}" height="${V}" fill="var(--rpc-grey-light, #e5e7eb)" rx="3" class="rpc-skel" style="animation-delay:${(a*7+s)*30}ms"/>`}return o+="</svg>",o}function Ze(t,n,e){let r=e,o=[],a=t.states[`sensor.${r}_last_error_code`];if(a&&a.state!=="0"&&a.state!==""&&a.state!=="unknown"&&a.state!=="unavailable"){let i=b(a.attributes.label??`Error ${a.state}`),c=b(a.attributes.description??""),p=b(a.attributes.action??""),d=[c,p].filter(Boolean).join(" ")||void 0;o.push({priority:1,text:`Error: ${i}`,subtext:d,category:"none"})}let s=t.states[`binary_sensor.${r}_maintenance_due`];if(s&&s.state==="on"){let i=t.states[`sensor.${r}_readiness`]?.state??"",c="Maintenance due";i==="bin_full"||i==="Bin Full"?c="Bin full \u2014 empty to continue":i&&i!=="Ready"&&i!=="unknown"&&i!=="unavailable"&&(c="Robot not ready \u2014 check the app"),o.push({priority:2,text:c,category:"health"})}if(n.hasWearRate){let i=t.states[`sensor.${r}_filter_wear_rate`],c=t.states[`sensor.${r}_filter_remaining_hours`];if(i&&i.state!=="unknown"&&i.state!=="unavailable"&&c){let g=c.attributes.threshold_hours,y=parseFloat(i.state)/(g/90);y>1.5&&o.push({priority:3,text:`Filter wearing ${y.toFixed(1)}\xD7 faster than normal`,subtext:"Check for dust or debris buildup.",category:"health"})}let p=t.states[`sensor.${r}_brush_wear_rate`],d=t.states[`sensor.${r}_brush_remaining_hours`];if(p&&p.state!=="unknown"&&p.state!=="unavailable"&&d){let g=d.attributes.threshold_hours,y=parseFloat(p.state)/(g/90);y>1.5&&o.push({priority:4,text:`Brush wearing ${y.toFixed(1)}\xD7 faster than normal`,subtext:"Check for hair tangles.",category:"health"})}}let l=t.states[`sensor.${r}_nav_quality`];if(l&&l.state!=="unknown"&&l.state!=="unavailable"){let i=parseInt(l.state,10);!isNaN(i)&&i<60&&o.push({priority:5,text:`Navigation quality low (${i}/100)`,subtext:"Check lighting or move obstacles in the cleaning area.",category:"health"})}if(n.hasConsecutiveSkips){let i=t.states[`sensor.${r}_consecutive_clean_skips`];if(i&&i.state!=="unknown"&&i.state!=="unavailable"){let c=parseInt(i.state,10);if(!isNaN(c)&&c>0){let p=`Robot blocked from cleaning ${c} consecutive time${c!==1?"s":""}`;o.push({priority:6,text:p,subtext:"Check blocking sensors or robot placement.",category:"health"})}}}if(n.hasWifiFloor){let i=t.states[`sensor.${r}_wifi_health`],c=i?.attributes?.weakest_bucket_observed;if(i&&typeof c=="number"&&!isNaN(c)){let p=je(c);p<50&&o.push({priority:7,text:`Wi-Fi signal dropped to ${p}% during last mission`,subtext:"Consider moving the router or adding a Wi-Fi extender.",category:"history"})}}return o}function $e(t,n,e,r){return Ze(t,n,e).some(o=>o.category===r)}function Ve(t,n,e,r){if(n.show_alerts===!1)return"";let o=Ze(t,e,r);if(o.length===0)return"";let a=o.sort((s,l)=>s.priority-l.priority)[0];return`
    <div class="rpc-zone rpc-zone5">
      <div class="rpc-alert-box" role="alert">
        <span class="rpc-alert-icon" aria-hidden="true">\u26A0\uFE0F</span>
        <div class="rpc-alert-content">
          <div class="rpc-alert-text">${a.text}</div>
          ${a.subtext?`<div class="rpc-alert-sub">${a.subtext}</div>`:""}
        </div>
      </div>
    </div>
  `}function Ue(t,n){return n?`${Math.round(t*.0929)} m\xB2`:`${t} ft\xB2`}function ht(t){return t==="robot_learned"?"\u{1F6A7}":t==="keepout"?"\u{1F6AB}":"\u{1F4CD}"}function gt(t){let n=t.room_name?` \xB7 ${t.room_name}`:"";return t.source==="stuck_events"?`Stuck hotspot${t.stuck_count?` (${t.stuck_count}\xD7)`:""}${n}`:t.source==="robot_learned"?`Robot-detected obstacle${n}`:t.source==="keepout"?`Keep-out zone${n}`:"Hazard"}function we(t,n,e,r,o,a){if(n.show_history===!1)return"";let s=r,l=n.history_days??28,i=n.area_unit??"auto",c=i==="m2"||i==="auto"&&a,{historyTab:p,hazards:d,mapSelectedRooms:g,suppressSubTabToggle:y,isMapContext:k}=o,h=t.states[`vacuum.${s}`]?.attributes??{},u=h.region_icons??{},v=h.last_cleaned_rooms??[],$=h.mission_destination??null,_=new Date().toLocaleDateString("en-CA"),S=o.openDay===_,C=t.states[`sensor.${s}_clean_streak`],H=t.states[`sensor.${s}_completion_rate_30d`],T=C?parseInt(C.state,10):0,z=H?parseInt(H.state,10):NaN,L="",R=[];if(T>0&&R.push(`\u{1F525} ${T}-day streak`),isNaN(z)||R.push(`${z}% completion rate`),e.hasCleaningSpeedTrend){let M=t.states[`sensor.${s}_cleaning_performance`]?.attributes?.trend;M==="declining"?R.push('<span class="rpc-trend-declining">\u2193 Speed declining</span>'):M==="improving"&&R.push('<span class="rpc-trend-improving">\u2191 Speed improving</span>')}R.length&&(L=`<div class="rpc-history-summary">${R.map((I,M)=>M===0?I:`<span class="rpc-summary-sep">\xB7</span>${I}`).join("")}</div>`);let U=e.hasCoverageImage&&!y?`
    <div class="rpc-history-tabs">
      <button class="rpc-tab${p==="calendar"?" active":""}" data-history-tab="calendar">Calendar</button>
      <button class="rpc-tab${p==="coverage"?" active":""}" data-history-tab="coverage">Coverage</button>
    </div>`:"",Y="";if(e.hasCoverageImage&&p==="coverage"){let M=t.states[`image.${s}_coverage_map`]?.attributes??{},P=M.x_min_mm,D=M.x_max_mm,A=M.y_min_mm,q=M.y_max_mm,f=M.entity_picture,F=M.last_mission_end,Z=P!=null&&D!=null&&A!=null&&q!=null,ae=Z?d.map(N=>{let J=xe(N.x_mm,N.y_mm,P,D,A,q),j=b(gt(N)),W=ht(N.source);return`<div class="rpc-hazard-pin rpc-pin-${N.source}" style="left:${J.left};top:${J.top}" title="${j}" aria-label="${j}">${W}</div>`}).join(""):"",oe=!Z&&f?'<div class="rpc-coverage-note">Spatial overlay unavailable \u2014 grid accumulating</div>':"",ue=F?`<div class="rpc-coverage-updated">Updated ${G(F,t.language)}</div>`:"",ne=d.some(N=>N.source==="stuck_events"),ee=d.some(N=>N.source==="robot_learned"),ie=d.some(N=>N.source==="keepout"),Q=[ne?"<span>\u{1F4CD}</span> Stuck hotspot":"",ee?"<span>\u{1F6A7}</span> Robot obstacle":"",ie?"<span>\u{1F6AB}</span> Keep-out zone":""].filter(Boolean).join(" "),te="";if(Z&&e.hasAlignment){let N=M.rooms??{},J=Object.values(N).map(B=>{if(!B.outline||B.outline.length<3)return"";let m=B.outline.map(([E,x])=>{let O=Fe(E,x,P,D,A,q);return`${O.x.toFixed(1)},${O.y.toFixed(1)}`}).join(" ");return`<polygon class="rpc-room-poly${g?.has(B.name)??!1?" rpc-room-poly--selected":""}"
          points="${m}" data-room-poly="${b(B.name)}" />`}).join(""),j=(()=>{let B=e.hasSmartZones?`select.${s}_smart_zone_select`:`select.${s}_zone_select`,m=t.states[B]?.attributes?.region_areas_m2;return m&&typeof m=="object"&&!Array.isArray(m)?m:{}})(),W=Object.values(N).map(B=>{let m=xe(B.x,B.y,P,D,A,q),w=re[B.icon]??"",E=g?.has(B.name)??!1,x=j[B.name],O=typeof x=="number"&&!isNaN(x)?` / ${x.toFixed(1)} m\xB2`:"";return`<div class="rpc-room-label${E?" rpc-room-label--selected":""}"
          style="left:${m.left};top:${m.top}" data-room-label="${b(B.name)}">
          ${w?`${w} `:""}${b(B.name)}${b(O)}
        </div>`}).join("");te=`
        <svg class="rpc-room-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
          ${J}
        </svg>
        ${W}
      `}Y=f?`
      <div class="rpc-coverage-panel">
        <div class="rpc-coverage-image-wrap">
          <img class="rpc-coverage-img" src="${f}" alt="Coverage map" />
          ${te}
          ${ae}
        </div>
        ${oe}
        <div class="rpc-coverage-legend">
          <span style="color:var(--rpc-green)">\u25CF</span> High coverage
          <span style="color:var(--rpc-grey-mid,#9ca3af)">\u25CF</span> Rarely cleaned
          ${Q}
        </div>
        ${ue}
      </div>`:'<div class="rpc-history-error">Coverage map unavailable</div>'}let K="";o.loading&&!o.data?K=qe(Math.ceil(l/7)):o.error?K=`<div class="rpc-history-error">${b(o.error)}</div>`:o.data&&(K=Ie(o.data,l,i,t.language,e.hasDirtDensity),o.data.length<l&&(K+=`<div class="rpc-history-partial">Showing ${o.data.length} of ${l} days \u2014 full history builds over time</div>`));let he="";if(e.hasProblemZone){let I=t.states[`sensor.${s}_problem_zone`],M=t.states[`sensor.${s}_stuck_count_30d`];if(I&&I.state!=="unknown"&&I.state!=="unavailable"){let P=M?parseInt(M.state,10):0;P>0&&(he=`<div class="rpc-problem-zone">\u26A0 ${b(I.state)} \u2014 stuck ${P}\xD7 in 30 days</div>`)}}let ce="";if(o.openDay){let M=new Date(o.openDay+"T00:00:00").toLocaleDateString(t.language,{weekday:"long",month:"long",day:"numeric",year:"numeric"}),P=o.dayMissions,D=o.openDaySummary,A="";if(P===null)A="";else if(D&&D.total===0)A='<div class="rpc-day-empty">No missions this day</div>';else if(P.length>0)A=P.map((f,F)=>{let Z=f.result==="completed"||f.result==="stuck_and_resumed"?"success":f.result==="stuck"||f.result==="stuck_and_abandoned"||f.result==="blocked_timeout"?"failure":"caution",ae=Z==="success"?"\u2713":Z==="failure"?"\u2717":"\u26A0",oe=Z==="success"?"rpc-day-ok":Z==="failure"?"rpc-day-err":"rpc-day-caution",ue=new Date(f.started_at).toLocaleTimeString(t.language,{hour:"2-digit",minute:"2-digit",hour12:!1}),ne=f.area_sqft!==null?Ue(f.area_sqft,c):"\u2014",ee=f.zones?.map(m=>b(m)).join(" \xB7 ")??"",ie=n.show_dirt_events&&f.dirt_events!=null&&f.dirt_events>0?`${f.dirt_events} dirt event${f.dirt_events!==1?"s":""}`:"",Q=[ee,ie].filter(Boolean).join(" \xB7 "),te=f.initiator==="demand"?'<span class="rpc-initiator-badge">demand</span>':"",N="";if(f.wifi_signal&&f.wifi_signal.length>0){let m=f.wifi_signal.length===5,w=Oe(f.wifi_signal),E=We(w,Math.min(...w));if(m){let x=Be(f.wifi_signal);x!==null&&(N=`<div class="rpc-day-wifi" aria-label="Wi-Fi signal quality: ${x}% average during mission"><span aria-hidden="true">\u{1F4F6}</span>${E}<span>${x}% avg</span></div>`)}else{let x=Math.min(...w);N=`<div class="rpc-day-wifi" aria-label="Wi-Fi signal: minimum ${x}% during mission"><span aria-hidden="true">\u{1F4F6}</span>${E}<span>${x}% min</span></div>`}}let J="";if(S&&F===P.length-1&&v.length>0){let m=v.map(E=>{let x=u[E],O=x?re[x]??"":"";return`<span class="rpc-trav-room">${O?O+"\xA0":""}${b(E)}</span>`}).join('<span class="rpc-trav-sep">\u2192</span>'),w=$?`<div class="rpc-mission-dest-popover">\u2192 Final: ${b($)}</div>`:"";J=`<div class="rpc-traversal-row">${m}</div>${w}`}let W="";f.room_coverage&&Object.keys(f.room_coverage).length>0&&(W=`<div class="rpc-room-coverage">${Object.entries(f.room_coverage).map(([w,E])=>{let x=Math.round(E*100);return`<span class="${x>=80?"rpc-cov-green":x>=60?"rpc-cov-amber":"rpc-cov-red"}">${b(w)} ${x}%</span>`}).join(" \xB7 ")}</div>`);let B="";return f.alignment_confidence!=null&&f.alignment_confidence<.85&&(B=`<div class="rpc-alignment-note">* Coverage estimates (alignment confidence: ${Math.round(f.alignment_confidence*100)}%)</div>`),`
          <div class="rpc-day-mission">
            <span class="rpc-day-icon ${oe}">${ae}</span>
            <span class="rpc-day-time">${ue}</span>
            <span class="rpc-day-dur">${f.duration_min} min</span>
            <span class="rpc-day-area">${ne}</span>
            ${te}
            ${Q?`<div class="rpc-day-zones">${Q}</div>`:""}
            ${N}
            ${J}
            ${W}
            ${B}
          </div>`}).join("");else if(D&&D.total>0){let f=D.area_sqft!==null?Ue(D.area_sqft,c):null;A=`
        <div class="rpc-day-aggregate">
          <div>${D.total} mission${D.total>1?"s":""} \xB7 ${b(D.result)}
            ${f?` \xB7 ${f} total`:""}</div>
          <div class="rpc-day-no-detail">Per-mission detail not available</div>
        </div>`}let q=D?.total??0;ce=`
      <div class="rpc-popover rpc-day-popover">
        <div class="rpc-popover-header">
          <span>${b(M)}</span>
          <button class="rpc-popover-close" data-close-day="true" aria-label="Close">\xD7</button>
        </div>
        <div class="rpc-popover-divider"></div>
        ${q>0&&P&&P.length>0?`<div class="rpc-day-count">${q} mission${q>1?"s":""}</div>`:""}
        ${A}
      </div>
    `}let pe="";if(n.show_lifetime!==!1){let I=t.states[`sensor.${s}_lifetime_missions`],M=t.states[`sensor.${s}_cleaning_analytics_30d`],P=I?parseInt(I.state,10):NaN,D=(()=>{let f=M?.attributes?.time_h;return typeof f=="number"?f:NaN})(),A=M?parseFloat(M.state):NaN;if(!isNaN(P)||!isNaN(D)||!isNaN(A)){let f=o.lifetimeExpanded?`
        <div class="rpc-lifetime-stats">
          <span class="rpc-lifetime-arrow">\u2192</span>
          ${isNaN(P)?"":`<span>${P.toLocaleString()} missions</span>`}
          ${isNaN(A)?"":`<span>${A.toLocaleString()} m\xB2</span>`}
          ${isNaN(D)?"":`<span>${D.toLocaleString()} h (30 d)</span>`}
        </div>`:"";pe=`
        <div class="rpc-lifetime-divider"></div>
        <button class="rpc-lifetime-toggle" data-lifetime-toggle aria-expanded="${o.lifetimeExpanded}">
          Stats ${o.lifetimeExpanded?"\u25B2":"\u25BC"}
        </button>
        ${f}
      `}}return`
    <div class="rpc-zone rpc-zone6">
      ${k?"":`<div class="rpc-zone-header">LAST ${l} DAYS</div>`}
      ${k?"":L}
      ${U}
      <div class="rpc-heatmap-wrap" data-heatmap>
        ${p==="coverage"&&e.hasCoverageImage?Y:K}
      </div>
      ${he}
      ${ce}
      ${k?"":pe}
    </div>
  `}function Ye(t,n,e,r,o){if((n.entities?.length??0)<2||!r)return"";let a=n.area_unit??"auto",s=a==="m2"||a==="auto"&&o;function l(h){return h==null?"":s?`${Math.round(h*.0929)} m\xB2`:`${Math.round(h)} ft\xB2`}function i(h){return h>=90?"rpc-cov-green":h>=70?"rpc-cov-amber":"rpc-cov-red"}let c=r.robots.map(h=>{let u=Math.round(h.completion_pct),v=l(h.area_sqft),$=[`${h.missions} mission${h.missions!==1?"s":""}`,v].filter(Boolean).join(" \xB7 ");return`
      <div class="rpc-household-robot">
        <span class="rpc-household-name">${b(h.name)}</span>
        <span class="${i(u)}">${u}%</span>
        <span class="rpc-household-meta">${$}</span>
      </div>`}).join(""),p="";r.floors&&r.floors.length>1&&(p=`<div class="rpc-household-floors">${r.floors.map(u=>{let v=l(u.area_sqft),$=[`${u.missions} mission${u.missions!==1?"s":""}`,v].filter(Boolean).join(" \xB7 ");return`
        <div class="rpc-household-floor">
          <span class="rpc-household-floor-label">${b(u.label)}</span>
          <span class="rpc-household-meta">${$}</span>
        </div>`}).join("")}</div>`);let d=r.total,g=Math.round(d.completion_pct),y=l(d.area_sqft),k=[`${d.missions} mission${d.missions!==1?"s":""}`,y].filter(Boolean).join(" \xB7 ");return`
    <div class="rpc-zone rpc-zone7">
      <div class="rpc-zone-header">HOUSEHOLD \u2014 LAST ${r.period_days} DAYS</div>
      ${c}
      ${p}
      <div class="rpc-household-divider"></div>
      <div class="rpc-household-robot rpc-household-combined">
        <span class="rpc-household-name">Combined</span>
        <span class="${i(g)}">${g}%</span>
        <span class="rpc-household-meta">${k}</span>
      </div>
    </div>`}function se(t,n){return t.states[n]?.state??"unavailable"}function Ge(t,n,e){return n==="m2"||n==="auto"&&e?`${Math.round(t*.0929)} m\xB2`:`${t} ft\xB2`}function bt(t,n){if(!t)return null;for(let e=t.length-1;e>=0;e--){let r=t[e];if(r.missions&&r.missions.length>0)for(let o=r.missions.length-1;o>=0;o--){let a=r.missions[o];if(a.result==="completed")return G(a.started_at,n)}else if(r.completed>0)return G(r.date+"T12:00:00Z",n)}return null}function ft(t){let n=["th","st","nd","rd"],e=t%100;return t+(n[(e-20)%10]??n[e]??n[0])}function Ke(t){let{hass:n,config:e,caps:r,robotName:o,loadingAction:a,todayMissionCount:s,roomPickerOpen:l,selectedRoomCount:i}=t,c=e.entity,p=se(n,c),d=n.states[c]?.attributes??{},g=n.config?.unit_system?.length==="m",y=e.area_unit??"auto",k=p==="unavailable",h=a!==null,u=o,v=`sensor.${u}_last_error_code`,$=`sensor.${u}_last_error_zone`,_=`sensor.${u}_mission_recharge_time`,S=`sensor.${u}_average_mission_time`,C=`sensor.${u}_area_cleaned_today`,H=d.mission_elapsed_min??null,T=d.mission_area_sqft??null,z=parseFloat(se(n,S)),L=isNaN(z)||z<=0?45:z,R=r.isMop,U=R?"\u{1F9F9}":"\u{1F916}",Y=b(d.friendly_name??c),K=n.states[`sensor.${u}_phase`]?.state??"",ce=(n.states[`binary_sensor.${u}_mission_active`]?.state??"")==="on",pe=r.hasMissionActive,I=n.states[`sensor.${u}_mission_expire_time`]?.state??"",M=I&&I!=="unavailable"&&I!=="unknown"?new Date(I):null,P=!!M&&!isNaN(M.getTime())&&M>new Date,D=P?Math.max(1,Math.round((M.getTime()-Date.now())/6e4)):null,A=!1;if(pe)A=p==="docked"&&ce;else{let m=se(n,_);A=p==="docked"&&(m!=="unavailable"&&m!=="unknown"&&I!=="unavailable"&&I!=="unknown")&&P}let q="";if(A&&r.hasMissionProgressSensor){let w=n.states[`sensor.${u}_mission_progress`]?.attributes?.recharge_min;typeof w=="number"&&(q=`<div class="rpc-recharge-line">\u26A1 Recharging \xB7 ${Math.round(w)} min</div>`)}let f="",F="",Z="";if(K==="evac")f="\u2B06",F="Emptying bin";else if(A)f="\u26A1",F=D!==null?`Recharging \u2014 resuming in ~${D} min`:"Recharging \u2014 mission continues";else switch(p){case"cleaning":f="\u25CF",F=R?"Mopping":"Cleaning";break;case"paused":f="\u23F8",F="Paused";break;case"returning":f="\u21A9",F="Returning to dock";break;case"docked":f="\u2713",F="Docked";break;case"idle":f="\u25CB",F="Idle";break;case"error":f="\u26A0",F="Error",Z="rpc-error-state";break;case"unavailable":f="\u2014",F="Unavailable";break}let ae="";if(p==="error"){let m=n.states[v];if(m&&m.state!=="0"&&m.state!==""&&m.state!=="unavailable"){let w=b(m.attributes.description??"Unknown error"),E=b(m.attributes.action??""),x=se(n,$),O=x&&x!=="unknown"&&x!=="unavailable";F=`Error ${b(m.state)} \u2014 ${w}`,ae=`
        ${E?`<div class="rpc-error-action">${E}</div>`:""}
        ${O?`<div class="rpc-error-zone">Zone: ${b(x)}</div>`:""}
      `}else F="Robot error \u2014 check the iRobot app"}let oe="";if((pe?ce:p==="cleaning"||A)&&r.hasArea){let m=parseFloat(se(n,C));if(!isNaN(m)&&m>0){let w=Ge(m,y,g),E=s!==null?s+1:null,x=E!==null&&E>1?` \xB7 ${b(ft(E))} mission`:"";oe=`<div class="rpc-area-today">${w} already today${x}</div>`}}let ne="";p==="cleaning"&&H!==null&&(ne=`<div class="rpc-progress-track"><div class="rpc-progress-fill" style="width:${Math.min(H/L*100,95)}%"></div></div>`);let ee="";if(p==="cleaning")if(r.hasMissionProgressSensor){let m=n.states[`sensor.${u}_mission_progress`],w=m?.attributes?.current_room,E=m&&m.state!=="unavailable"&&m.state!=="unknown"?parseFloat(m.state):NaN;if(w||!isNaN(E)){let x=[];w&&x.push(b(w)),isNaN(E)||x.push(`${Math.round(E)}%`),ee=`<div class="rpc-spatial-line">${x.join(" \xB7 ")}</div>`}}else{let m=d.mission_destination;m&&(ee=`<div class="rpc-spatial-line">\u2192 Targeting: ${b(m)}</div>`)}let ie="";if(p==="cleaning"){let m=[];if(H!==null){let w=Math.max(0,Math.round(L-H));m.push(`<div class="rpc-metric"><span class="rpc-metric-val">~${w} min</span><span class="rpc-metric-lbl">Remaining</span></div>`)}if(r.hasArea&&T!==null){m.push(`<div class="rpc-metric"><span class="rpc-metric-val">${Ge(T,y,g)}</span><span class="rpc-metric-lbl">Cleaned</span></div>`);let w=parseFloat(se(n,`sensor.${u}_cleaning_analytics_30d`)),E=parseFloat(se(n,`sensor.${u}_missions_last_30d`)),x=!isNaN(w)&&!isNaN(E)&&E>=5?w/E:NaN;if(!isNaN(x)&&x>0){let O=Math.round((T-x)/x*100),me=O>=0?"\u25B2":"\u25BC",rt=O>=0?"rpc-delta-up":"rpc-delta-down";m.push(`<div class="rpc-metric"><span class="rpc-metric-val ${rt}">${me} ${Math.abs(O)}%</span><span class="rpc-metric-lbl">vs usual</span></div>`)}}m.length&&(ie=`<div class="rpc-metrics-row">${m.join("")}</div>`)}let Q="";if(p==="docked"&&!A){let m=bt(t.missionData,n.language);if(m)Q=`<div class="rpc-docked-since">Last cleaned: ${m}</div>`;else{let w=n.states[c]?.last_changed;w&&(Q=`<div class="rpc-docked-since">Last mission: ${G(w,n.language)}</div>`)}}let te="";r.hasDemandBlocked&&n.states[`binary_sensor.${u}_demand_clean_blocked`]?.state==="on"&&(te='<div class="rpc-demand-blocked">\u{1F9F9} Floor needs cleaning \u2014 waiting for home to be empty</div>');let N="";if(r.hasCleanedRooms&&(p==="docked"||p==="idle")&&!A){let m=d.last_cleaned_rooms,w=d.region_icons;m&&m.length>0&&(N=`<div class="rpc-cleaned-rooms">${m.map(x=>{let O=w?.[x],me=O?re[O]??"":"";return`<span class="rpc-cleaned-chip">${me?me+"\xA0":""}${b(x)}</span>`}).join("")}</div>`)}let J='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',j=(m,w,E)=>{let x=a===m;return`<button class="rpc-btn${x?" rpc-btn-loading":""}"
      data-action="${m}"
      ${k||h?"disabled":""}
      aria-label="${w}">
      ${x?J:E}
    </button>`},W="",B=r.hasDemandBlocked&&n.states[`binary_sensor.${u}_demand_clean_blocked`]?.state==="on";return p==="cleaning"||K==="evac"?W=j("pause","Pause","\u23F8 Pause")+j("return_home","Return home","\u{1F3E0} Return home"):p==="paused"?W=j("resume","Resume","\u25B6 Resume")+j("return_home","Return home","\u{1F3E0} Return home")+j("stop","Stop","\u23F9 Stop"):p==="error"?W=j("return_home","Return home","\u{1F3E0} Return home")+j("retry","Retry","\u{1F504} Retry"):A?W=j("return_home","Cancel mission","\u2715 Cancel mission"):p!=="returning"&&!k&&(i>0?W=j("clean-selected","Start selected rooms",`\u25B6 Start ${i} selected room${i!==1?"s":""}`):(W=j("start","Start full clean",B?"\u25B6 Start anyway":"\u25B6 Start full clean"),e.mode!=="companion"&&r.hasSmartZones&&(W+=`<button class="rpc-btn" data-action="toggle-room-picker" aria-expanded="${l}">
          \u{1F5FA} Rooms\u2026
        </button>`))),`
    <div class="rpc-header${Z?" "+Z:""}">
      <div class="rpc-robot-identity">
        <span class="rpc-robot-icon">${U}</span>
        <span class="rpc-robot-name">${Y}</span>
      </div>
      <div class="rpc-state-row">
        <span class="rpc-state-dot rpc-state-${p}">${f}</span>
        <span class="rpc-state-label">${F}</span>
      </div>
      ${oe}
      ${ae}
      ${ne}
      ${ee}
      ${q}
      ${ie}
      ${Q}
      ${te}
      ${N}
      ${W?`<div class="rpc-actions">${W}</div>`:""}
    </div>
  `}function Je(t,n){let e=[];return t.mode!=="companion"&&n.hasCoverageImage&&e.push({id:"map",icon:"\u{1F5FA}",label:"Map"}),e.push({id:"history",icon:"\u{1F4C5}",label:"History"}),e.push({id:"health",icon:"\u2764",label:"Health"}),e.push({id:"settings",icon:"\u2699",label:""}),e}function ke(t,n){return t.default_tab?t.default_tab:t.mode!=="companion"&&n.hasCoverageImage?"map":"history"}function Qe(t,n,e){let r=e;if(n.hasRobotHealthScore){let o=t.states[`sensor.${r}_robot_health_score`];if(o&&o.state!=="unknown"&&o.state!=="unavailable"){let a=parseFloat(o.state);if(!isNaN(a)&&a<60)return!0}}if(n.hasMaintenanceCalendar){let o=[`sensor.${r}_wheel_last_cleaned`,`sensor.${r}_contact_last_cleaned`,`sensor.${r}_bin_last_cleaned`],a=Date.now();for(let s of o){let l=t.states[s];if(!l||l.state==="unavailable"||l.state==="unknown")continue;let i=new Date(l.state).getTime();if(!isNaN(i)&&(a-i)/864e5>90)return!0}}return!!$e(t,n,e,"health")}function Xe(t,n,e){return $e(t,n,e,"history")}function et(t,n,e={}){return`
    <div class="rpc-tab-bar" role="tablist">
      ${t.map(r=>`
        <button class="rpc-tab-btn${r.id===n?" rpc-tab-btn--active":""}"
                role="tab" aria-selected="${r.id===n}"
                data-tab="${r.id}">
          <span class="rpc-tab-icon">${r.icon}</span>${r.label?`<span class="rpc-tab-label">${r.label}</span>`:""}
          ${e[r.id]?'<span class="rpc-tab-badge"></span>':""}
        </button>
      `).join("")}
    </div>
  `}var tt=`
  :host {
    display: block;
    font-family: inherit;
    /* Semantic colours \u2014 cascade from HA theme when available, fall back to
       accessible defaults that match the standard HA colour palette.
       --state-active-color / --warning-color / --error-color are defined by
       every HA theme including Bubble Card themes and the default theme.      */
    /* B1 fix (v2.0): fixed constant, not var(--state-active-color, ...).
       Themes like Casa5/Bubble Card redefine --state-active-color in ways
       that can render this token amber-ish, breaking the green/amber/red
       health-bar invariant. Health colour semantics must never depend on
       a theme variable that wasn't designed for this purpose. */
    --rpc-green:      #4ade80;
    --rpc-amber:      var(--warning-color,         #d97706);
    --rpc-red:        var(--error-color,           #db4437);
    --rpc-blue:       var(--primary-color,         #2563eb);
    --rpc-grey-light: var(--divider-color,         #e5e7eb);
    --rpc-grey-mid:   var(--disabled-text-color,   #9ca3af);
    /* Heatmap empty-cell colour follows the card's secondary surface */
    --rpc-cell-empty: var(--secondary-background-color, #e5e7eb);
    --rpc-card-padding:   16px;
    --rpc-bar-height:     6px;
    --rpc-bar-row-height: 44px;
    --rpc-bar-radius:     3px;
    --rpc-dot-size:       8px;
    --rpc-cell-size:      20px;
    --rpc-cell-touch:     24px;
    --rpc-cell-gap:       3px;
  }

  .rpc-card {
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border-radius: var(--ha-card-border-radius, 12px);
    padding: var(--rpc-card-padding);
    color: var(--primary-text-color);
    box-shadow: var(--ha-card-box-shadow, none);
  }

  /* \u2500\u2500\u2500 Zones \u2500\u2500\u2500 */
  .rpc-zone { padding: 12px 0; }
  .rpc-zone + .rpc-zone { border-top: 1px solid var(--divider-color, rgba(0,0,0,.08)); }

  .rpc-zone-header {
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.06em; color: var(--secondary-text-color, #9ca3af);
    margin-bottom: 8px;
  }

  /* \u2500\u2500\u2500 v2.0 Persistent header (was Zone 1 \u2014 Status) \u2500\u2500\u2500 */
  .rpc-header { padding: 0 0 12px; border-bottom: 1px solid var(--divider-color, rgba(0,0,0,.08)); margin-bottom: 4px; }
  .rpc-robot-identity { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
  .rpc-robot-icon { font-size: 1.1rem; }
  .rpc-robot-name { font-size: 0.9rem; font-weight: 600; color: var(--secondary-text-color, #9ca3af); }

  .rpc-state-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .rpc-state-dot { font-size: 1.1rem; line-height: 1; }
  .rpc-state-dot.rpc-state-cleaning {
    color: var(--rpc-green);
    animation: rpc-blink 1.4s ease-in-out infinite;
  }
  .rpc-state-dot.rpc-state-error     { color: var(--rpc-red); }
  .rpc-state-dot.rpc-state-docked    { color: var(--rpc-green); }
  .rpc-state-dot.rpc-state-returning { color: var(--rpc-amber); }
  @keyframes rpc-blink { 0%,100%{opacity:1} 50%{opacity:.4} }

  .rpc-state-label { font-size: 1rem; font-weight: 500; }
  .rpc-error-state { border-left: 3px solid var(--rpc-red); padding-left: 10px; }
  .rpc-error-action, .rpc-error-zone {
    font-size: 0.8rem; color: var(--secondary-text-color);
    margin-top: 2px; margin-left: 28px;
  }

  /* Wave A3 \u2014 area-today */
  .rpc-area-today {
    font-size: 0.8rem; color: var(--secondary-text-color);
    margin: 2px 0 4px 28px;
  }

  /* Progress bar */
  .rpc-progress-track {
    height: 4px; background: var(--rpc-grey-light);
    border-radius: 2px; margin: 8px 0; overflow: hidden;
  }
  .rpc-progress-fill {
    height: 100%; background: var(--rpc-green);
    border-radius: 2px; transition: width 1s ease;
  }

  /* Metrics */
  .rpc-metrics-row { display: flex; gap: 20px; margin: 8px 0; }
  .rpc-metric { display: flex; flex-direction: column; gap: 2px; }
  .rpc-metric-val { font-size: 1.15rem; font-weight: 600; }
  .rpc-metric-lbl { font-size: 0.7rem; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: .04em; }
  .rpc-delta-up   { color: var(--rpc-green); }
  .rpc-delta-down { color: var(--rpc-amber); }
  .rpc-robot-selector { margin-bottom: 10px; }
  .rpc-robot-select { width: 100%; background: var(--card-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color); border-radius: 6px; padding: 6px 8px; font-size: 0.9rem; cursor: pointer; }
  .rpc-docked-since { font-size: 0.8rem; color: var(--secondary-text-color); margin-top: 4px; }
  .rpc-demand-blocked { font-size: 0.8rem; color: var(--rpc-amber); margin-top: 4px; }

  /* Action buttons */
  .rpc-actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
  .rpc-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 14px; border-radius: 8px; border: none;
    font-size: 0.85rem; font-weight: 500; cursor: pointer;
    transition: opacity 0.15s; background: var(--primary-color, #2563eb); color: #fff;
    min-height: 36px; font-family: inherit;
  }
  .rpc-btn:hover:not(:disabled) { opacity: 0.85; }
  .rpc-btn:disabled, .rpc-btn-disabled { opacity: 0.45; cursor: default; }
  .rpc-btn-loading { opacity: 0.7; cursor: wait; }
  .rpc-btn-primary { width: 100%; padding: 10px; font-size: 0.9rem; }
  .rpc-btn-secondary {
    background: transparent; border: 1px solid var(--divider-color, rgba(0,0,0,.15));
    color: var(--primary-text-color); width: 100%; margin-top: 10px;
  }
  .rpc-btn-text {
    background: none; border: none; color: var(--secondary-text-color);
    font-size: 0.8rem; cursor: pointer; padding: 4px 6px; font-family: inherit;
    margin-top: 4px; align-self: flex-end;
  }
  .rpc-btn-text:hover { color: var(--primary-text-color); }
  .rpc-send-error { font-size: 0.78rem; color: var(--rpc-red); margin-top: 6px; }

  /* Spinner */
  .rpc-spinner {
    width: 16px; height: 16px; flex-shrink: 0;
    animation: rpc-spin 0.8s linear infinite;
  }
  .rpc-spinner-sm { width: 12px; height: 12px; }
  @keyframes rpc-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  /* \u2500\u2500\u2500 Zone 2 \u2014 Room Selector \u2500\u2500\u2500 */
  .rpc-chips-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px; }
  .rpc-room-chip {
    padding: 5px 12px; border-radius: 20px;
    border: 1.5px solid var(--primary-color, #2563eb);
    background: transparent; color: var(--primary-color, #2563eb);
    font-size: 0.82rem; cursor: pointer; font-family: inherit;
    transition: background 0.12s, color 0.12s;
  }
  .rpc-room-chip--selected { background: var(--primary-color, #2563eb); color: #fff; }
  .rpc-selected-count { font-size: 0.78rem; color: var(--secondary-text-color); margin-left: auto; }
  .rpc-passes-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
  .rpc-passes-label { font-size: 0.8rem; color: var(--secondary-text-color); margin-right: 4px; }
  .rpc-pass-chip {
    padding: 3px 10px; border-radius: 12px;
    border: 1px solid var(--divider-color, rgba(0,0,0,.2));
    background: transparent; color: var(--primary-text-color);
    font-size: 0.78rem; cursor: pointer; font-family: inherit; transition: background 0.12s;
  }
  .rpc-pass-chip--selected { background: var(--secondary-background-color, #f3f4f6); font-weight: 600; }
  .rpc-room-actions { display: flex; flex-direction: column; gap: 4px; }

  /* \u2500\u2500\u2500 Zone 3 \u2014 Health \u2500\u2500\u2500 */
  .rpc-bar-row {
    display: flex; align-items: center; min-height: var(--rpc-bar-row-height);
    gap: 8px; cursor: pointer; border-radius: 6px; padding: 0 2px;
    transition: background 0.12s;
  }
  .rpc-bar-row:hover { background: var(--secondary-background-color, rgba(0,0,0,.04)); }
  .rpc-bar-label { font-size: 0.82rem; color: var(--secondary-text-color); min-width: 65px; flex-shrink: 0; }
  .rpc-bar-track { flex: 1; height: var(--rpc-bar-height); background: var(--rpc-grey-light); border-radius: var(--rpc-bar-radius); overflow: hidden; }
  .rpc-bar-fill  { height: 100%; border-radius: var(--rpc-bar-radius); transition: width 0.4s ease; }
  .rpc-bar-pct   { font-size: 0.8rem; font-weight: 600; min-width: 36px; text-align: right; flex-shrink: 0; }
  .rpc-bar-hours { font-size: 0.78rem; color: var(--secondary-text-color); min-width: 30px; flex-shrink: 0; }
  .rpc-bar-arrow { font-size: 0.78rem; font-weight: 600; flex-shrink: 0; }
  .rpc-bar-cleanbase-state { font-size: 0.82rem; color: var(--secondary-text-color); flex: 1; }

  /* Wear legend */
  .rpc-wear-legend {
    display: flex; flex-direction: column; gap: 3px;
    background: var(--secondary-background-color, #f3f4f6);
    border-radius: 6px; padding: 8px 10px; margin: 8px 0;
    font-size: 0.78rem; color: var(--secondary-text-color);
  }
  .rpc-wear-legend-title {
    font-weight: 600; color: var(--primary-text-color);
    margin-bottom: 2px; font-size: 0.8rem;
  }

  /* Wave A4 \u2014 Mop config row */
  .rpc-health-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 6px 0; }
  .rpc-mop-config { font-size: 0.82rem; color: var(--secondary-text-color); padding: 4px 2px; }

  /* F3b \u2014 compact divider + CONTROLS label when settings relocate to Status zone */
  .rpc-settings-divider--compact { margin: 8px 0 4px; }
  .rpc-controls-label { margin-top: 4px; margin-bottom: 4px; }

  /* v1.3 \u2014 static bar rows (no popover / click interaction) */
  .rpc-bar-row--static { cursor: default; }
  .rpc-bar-row--static:hover { background: transparent; }

  /* v2.0 C1-HEALTH \u2014 robot health score */
  .rpc-health-score {
    display: flex; align-items: baseline; gap: 10px;
    padding: 8px 2px 4px;
  }
  .rpc-health-score--calibrating { align-items: center; }
  .rpc-health-score-label {
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.05em; color: var(--secondary-text-color, #9ca3af);
  }
  .rpc-health-score-value { font-size: 1.6rem; font-weight: 700; line-height: 1; }
  .rpc-health-score-band  { font-size: 0.75rem; font-weight: 600; }
  .rpc-health-score-calibrating {
    font-size: 0.82rem; color: var(--secondary-text-color, #9ca3af); font-style: italic;
  }
  .rpc-health-details-toggle {
    background: none; border: none; cursor: pointer; padding: 2px 2px 8px;
    font-size: 0.78rem; color: var(--primary-color, #2563eb);
    font-family: inherit;
  }

  /* v2.0 C5-ANOMALY \u2014 mission anomaly banner */
  .rpc-anomaly-banner {
    background: color-mix(in srgb, var(--rpc-amber) 12%, transparent);
    border-left: 3px solid var(--rpc-amber);
    border-radius: 4px;
    padding: 8px 10px;
    font-size: 0.82rem;
    margin-bottom: 6px;
  }

  /* v2.0 C2-MAINT \u2014 maintenance calendar */
  .rpc-maint-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 8px 0 6px; }
  .rpc-maint-header {
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.05em; color: var(--secondary-text-color, #9ca3af);
    margin-bottom: 4px;
  }
  .rpc-maint-row {
    display: flex; align-items: center; justify-content: space-between;
    min-height: 36px; cursor: pointer; padding: 2px 2px;
  }
  .rpc-maint-row:hover { background: var(--secondary-background-color, rgba(0,0,0,.04)); }
  .rpc-maint-label { font-size: 0.82rem; }
  .rpc-maint-val   { font-size: 0.82rem; color: var(--secondary-text-color, #9ca3af); }
  .rpc-maint-service {
    font-family: monospace; font-size: 0.78rem; background: var(--secondary-background-color, rgba(0,0,0,.05));
    padding: 4px 6px; border-radius: 4px; margin-top: 2px; word-break: break-all;
  }

  /* v2.0 \u2014 \u2699 tab maintenance service links */
  .rpc-maint-link-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 4px 2px 0; font-size: 0.8rem;
  }
  .rpc-maint-link-label   { color: var(--primary-text-color); }
  .rpc-maint-link-service {
    font-family: monospace; font-size: 0.72rem; color: var(--secondary-text-color, #9ca3af);
  }
  /* v2.0.1: per-row "last reset" line, mirroring the Health tab's
     maintenance calendar rows so all four rows (wheel/contact/bin/battery)
     show consistent recency information instead of only three of them. */
  .rpc-maint-link-lastreset {
    font-size: 0.72rem; color: var(--secondary-text-color, #9ca3af);
    padding: 0 2px 8px;
  }
  .rpc-maint-link-hint {
    font-size: 0.72rem; color: var(--secondary-text-color, #9ca3af);
    margin-top: 4px; font-style: italic;
  }

  /* v1.3 \u2014 coverage "Building history\u2026" skeleton text */
  .rpc-coverage-building {
    flex: 1; font-size: 0.8rem; color: var(--secondary-text-color);
    font-style: italic;
  }

  /* v1.3 \u2014 battery health group separator */
  .rpc-health-battery-sep { height: 1px; background: var(--divider-color, rgba(0,0,0,.06)); margin: 4px 0; }

  /* v1.3 \u2014 retention popover body + sub-line */
  .rpc-popover-body { padding: 4px 0; font-size: 0.85rem; display: flex; flex-direction: column; gap: 6px; }
  .rpc-popover-sub  { font-size: 0.78rem; color: var(--secondary-text-color); }

  /* v1.3 \u2014 battery EOL lines inside retention popover */
  .rpc-retention-eol      { font-size: 0.82rem; color: var(--secondary-text-color); }
  .rpc-retention-eol--warn { color: var(--rpc-red); font-weight: 500; }

  /* \u2500\u2500\u2500 Popovers \u2500\u2500\u2500 */
  .rpc-popover {
    background: var(--secondary-background-color, #f9fafb);
    border: 1px solid var(--divider-color, rgba(0,0,0,.1));
    border-radius: 8px; padding: 12px; margin: 4px 0 6px;
    animation: rpc-expand 0.15s ease-out;
  }
  @keyframes rpc-expand { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  .rpc-popover-header {
    display: flex; justify-content: space-between; align-items: center;
    font-weight: 600; font-size: 0.88rem; margin-bottom: 8px;
  }
  .rpc-popover-close {
    background: none; border: none; font-size: 1.1rem; cursor: pointer;
    color: var(--secondary-text-color); line-height: 1; padding: 0 4px; font-family: inherit;
  }
  .rpc-popover-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.1)); margin: 8px -12px; }
  .rpc-popover-row {
    display: flex; justify-content: space-between;
    font-size: 0.82rem; color: var(--secondary-text-color); margin-bottom: 6px;
  }
  .rpc-popover-row span:last-child { color: var(--primary-text-color); font-weight: 500; }
  .rpc-popover-bar-track { height: 8px; background: var(--rpc-grey-light); border-radius: 4px; overflow: hidden; margin: 8px 0; }
  .rpc-popover-bar-fill  { height: 100%; border-radius: 4px; }

  /* Day popover */
  .rpc-day-count   { font-size: 0.82rem; color: var(--secondary-text-color); margin-bottom: 8px; }
  .rpc-day-empty   { font-size: 0.82rem; color: var(--secondary-text-color); }
  .rpc-day-mission { display: flex; align-items: baseline; gap: 8px; font-size: 0.82rem; margin-bottom: 6px; flex-wrap: wrap; }
  .rpc-day-icon  { font-weight: 700; flex-shrink: 0; }
  .rpc-day-ok      { color: var(--rpc-green); }
  .rpc-day-caution { color: var(--rpc-amber); }
  .rpc-day-err     { color: var(--rpc-red); }
  .rpc-day-time  { font-weight: 500; }
  .rpc-day-dur, .rpc-day-area { color: var(--secondary-text-color); }
  .rpc-day-zones { width: 100%; padding-left: 20px; color: var(--secondary-text-color); font-size: 0.78rem; }
  .rpc-day-aggregate { font-size: 0.82rem; }
  .rpc-day-no-detail { font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 4px; }
  /* F1: demand initiator badge \u2014 robot cleaned because floor was dirty */
  .rpc-initiator-badge {
    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
    color: var(--rpc-blue); background: color-mix(in srgb, var(--rpc-blue) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--rpc-blue) 25%, transparent);
    border-radius: 4px; padding: 1px 5px; vertical-align: middle; white-space: nowrap;
    flex-shrink: 0;
  }
  /* v1.3 \u2014 WiFi sparkline row in day popover */
  .rpc-day-wifi {
    width: 100%; padding-left: 20px; display: flex; align-items: center; gap: 6px;
    font-size: 0.78rem; color: var(--secondary-text-color); margin-top: 2px;
  }

  /* \u2500\u2500\u2500 Zone 4 \u2014 Schedule \u2500\u2500\u2500 */
  .rpc-schedule-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
  .rpc-next-clean { display: flex; flex-direction: column; gap: 2px; }
  .rpc-schedule-label { font-size: 0.75rem; color: var(--secondary-text-color); }
  .rpc-schedule-time  { font-size: 0.9rem; font-weight: 600; }
  .rpc-hold-badge {
    padding: 4px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 500;
    border: none; cursor: pointer; font-family: inherit;
    display: inline-flex; align-items: center; gap: 4px;
    transition: opacity 0.15s; white-space: nowrap;
  }
  .rpc-hold-badge:hover { opacity: 0.8; }
  .rpc-badge-green { background: rgba(45,156,79,.15);  color: var(--rpc-green); }
  .rpc-badge-amber { background: rgba(217,119,6,.15);  color: var(--rpc-amber); }
  .rpc-badge-blue  { background: rgba(37,99,235,.15);  color: var(--rpc-blue); }
  .rpc-hold-tooltip {
    font-size: 0.78rem; color: var(--secondary-text-color);
    background: var(--secondary-background-color, #f3f4f6);
    border-radius: 6px; padding: 6px 10px; margin-top: 4px;
    animation: rpc-expand 0.15s ease-out;
  }
  .rpc-presence-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .rpc-presence-dot { display: flex; align-items: center; gap: 5px; font-size: 0.82rem; }
  .rpc-dot { display: inline-block; width: var(--rpc-dot-size); height: var(--rpc-dot-size); border-radius: 50%; flex-shrink: 0; }
  .rpc-dot-green { background: var(--rpc-green); }
  .rpc-dot-amber { background: var(--rpc-amber); }
  .rpc-presence-label { color: var(--secondary-text-color); }

  /* \u2500\u2500\u2500 Zone 5 \u2014 Alerts \u2500\u2500\u2500 */
  .rpc-zone5 { animation: rpc-expand 0.2s ease-out; }
  .rpc-alert-box {
    display: flex; gap: 10px; align-items: flex-start;
    background: rgba(220,38,38,.07); border: 1px solid rgba(220,38,38,.2);
    border-radius: 8px; padding: 10px 12px;
  }
  .rpc-alert-icon    { font-size: 1rem; flex-shrink: 0; line-height: 1.4; }
  .rpc-alert-text    { font-size: 0.85rem; font-weight: 500; }
  .rpc-alert-sub     { font-size: 0.78rem; color: var(--secondary-text-color); margin-top: 2px; }

  /* \u2500\u2500\u2500 Wave B/C additions \u2500\u2500\u2500 */

  /* B1 \u2014 Presence analytics */
  .rpc-schedule-times { display: flex; flex-direction: column; gap: 4px; }
  .rpc-next-clean--likely .rpc-schedule-time { color: var(--secondary-text-color); }
  .rpc-schedule-time--approx { font-style: italic; }
  .rpc-presence-analytics {
    font-size: 0.78rem; color: var(--secondary-text-color);
    margin-top: 6px; padding: 4px 2px;
  }

  /* B3 \u2014 Settings panel */
  .rpc-settings-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 10px 0 0; }
  .rpc-settings-row {
    display: flex; align-items: center; gap: 6px; width: 100%;
    background: none; border: none; cursor: pointer; font-family: inherit;
    font-size: 0.8rem; color: var(--secondary-text-color);
    padding: 8px 2px; text-align: left;
  }
  .rpc-settings-row:hover { color: var(--primary-text-color); }
  .rpc-settings-icon { font-size: 0.9rem; }
  .rpc-settings-label { flex: 1; }
  .rpc-settings-arrow { font-size: 0.7rem; }

  .rpc-settings-panel {
    display: flex; flex-wrap: wrap; gap: 6px 16px;
    padding: 8px 2px 4px; animation: rpc-expand 0.15s ease-out;
  }
  .rpc-setting-item { display: flex; align-items: center; gap: 6px; }
  .rpc-setting-label { font-size: 0.8rem; color: var(--secondary-text-color); }
  .rpc-setting-toggle {
    background: none; border: none; cursor: pointer; font-size: 0.9rem;
    color: var(--secondary-text-color); font-family: inherit; padding: 2px 4px;
    border-radius: 4px; transition: color 0.12s;
  }
  .rpc-setting-toggle:hover { color: var(--primary-text-color); }
  .rpc-setting-on { color: var(--rpc-green) !important; }
  .rpc-setting-cycle {
    background: var(--secondary-background-color, #f3f4f6);
    border: 1px solid var(--divider-color, rgba(0,0,0,.15));
    border-radius: 6px; padding: 3px 8px; font-size: 0.78rem;
    cursor: pointer; font-family: inherit; color: var(--primary-text-color);
  }
  .rpc-setting-cycle:hover { opacity: 0.8; }

  /* C1 \u2014 Lifetime stats */
  .rpc-lifetime-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 10px 0 0; }
  .rpc-lifetime-toggle {
    background: none; border: none; cursor: pointer; font-family: inherit;
    font-size: 0.78rem; color: var(--secondary-text-color);
    padding: 8px 2px; width: 100%; text-align: left;
  }
  .rpc-lifetime-toggle:hover { color: var(--primary-text-color); }
  .rpc-lifetime-stats {
    display: flex; gap: 12px; flex-wrap: wrap;
    font-size: 0.82rem; color: var(--secondary-text-color);
    padding: 2px 2px 6px; animation: rpc-expand 0.15s ease-out;
  }
  .rpc-lifetime-arrow { color: var(--secondary-text-color); }
  .rpc-lifetime-stats span { white-space: nowrap; }
  .rpc-history-summary {
    display: flex; flex-wrap: wrap; align-items: center; gap: 4px 0;
    font-size: 0.82rem; color: var(--secondary-text-color); margin-bottom: 8px;
  }
  .rpc-summary-sep { margin: 0 5px; opacity: 0.5; }
  /* v1.3 \u2014 speed trend colour tokens in history summary bar */
  .rpc-trend-declining { color: var(--rpc-amber); font-weight: 500; }
  .rpc-trend-improving { color: var(--rpc-green); font-weight: 500; }
  /* v2.0: heatmap promoted to full-width Map/History tabs \u2014 SVG now scales
   * responsively instead of rendering at fixed natural size. The svg's own
   * width/height attributes (200\xD7NNN at the current 24px CELL constant in
   * heatmap.ts) become the intrinsic aspect-ratio source for the viewBox;
   * CSS width/height here override layout sizing without touching the
   * coordinate system inside the SVG, so heatmap.ts and its fixed-geometry
   * tests are unaffected by this purely presentational change.
   * clamp(min, container-driven, max): min \u2248 7 cols \xD7 8px cells (smallest
   * touch-safe size per the v2.0 plan); max = current 200px / 24px cells
   * (the pre-v2.0 fixed size) so wide desktop columns don't render an
   * oversized calendar. */
  .rpc-heatmap-wrap { overflow: hidden; }
  .rpc-heatmap-wrap svg {
    display: block;
    width: clamp(88px, 100%, 200px);
    height: auto;
  }
  .rpc-history-error   { font-size: 0.82rem; color: var(--secondary-text-color); padding: 8px 0; }
  .rpc-history-partial { font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 6px; }
  .rpc-problem-zone    { font-size: 0.8rem; color: var(--rpc-amber); margin-top: 8px; }

  /* \u2500\u2500 v1.5 \u2014 History tab toggle (Calendar / Coverage) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-history-tabs { display: flex; gap: 6px; margin-bottom: 8px; }
  .rpc-tab {
    padding: 3px 12px; border-radius: 12px;
    border: 1px solid var(--divider-color, rgba(0,0,0,.2));
    background: transparent; color: var(--secondary-text-color);
    font-size: 0.78rem; cursor: pointer; font-family: inherit;
    transition: background 0.12s, color 0.12s;
  }
  .rpc-tab.active { background: var(--rpc-blue); color: #fff; border-color: transparent; }

  /* \u2500\u2500 v1.5 \u2014 Coverage heatmap panel \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-coverage-panel { margin-top: 8px; }
  .rpc-coverage-image-wrap { position: relative; }
  .rpc-coverage-img { width: 100%; display: block; border-radius: 8px; }
  .rpc-hazard-pin {
    position: absolute; transform: translate(-50%, -100%);
    cursor: pointer; font-size: 1rem; line-height: 1;
    touch-action: manipulation;
  }
  /* Source-specific opacity: stuck hotspots fullweight, others slightly muted */
  .rpc-pin-robot_learned { opacity: 0.85; }
  .rpc-pin-keepout        { opacity: 0.80; }
  .rpc-coverage-legend {
    display: flex; flex-wrap: wrap; gap: 10px;
    font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 6px;
  }
  .rpc-coverage-updated { font-size: 0.72rem; color: var(--secondary-text-color); margin-top: 4px; }
  .rpc-coverage-note    { font-size: 0.72rem; color: var(--secondary-text-color); margin-top: 4px; font-style: italic; }

  /* \u2500\u2500 v2.0 C7-ROOM-BOUNDS \u2014 room polygon overlay + tap-to-select \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-room-overlay {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; /* polygons opt back in individually below */
  }
  .rpc-room-poly {
    fill: var(--primary-color, #2563eb); fill-opacity: 0.08;
    stroke: var(--primary-color, #2563eb); stroke-opacity: 0.35; stroke-width: 0.4;
    cursor: pointer; pointer-events: auto;
  }
  .rpc-room-poly:hover       { fill-opacity: 0.16; stroke-opacity: 0.6; }
  .rpc-room-poly--selected   { fill-opacity: 0.28; stroke-opacity: 0.9; stroke-width: 0.6; }
  .rpc-room-label {
    position: absolute; transform: translate(-50%, -50%);
    font-size: 0.7rem; padding: 1px 5px; border-radius: 8px;
    background: var(--card-background-color, #fff); color: var(--primary-text-color);
    box-shadow: 0 1px 2px rgba(0,0,0,.15);
    cursor: pointer; white-space: nowrap; pointer-events: auto;
  }
  .rpc-room-label--selected {
    background: var(--primary-color, #2563eb); color: #fff;
  }

  /* \u2500\u2500 v1.5 \u2014 F8 room coverage chips in day popover \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-room-coverage {
    width: 100%; padding-left: 20px;
    display: flex; flex-wrap: wrap; gap: 5px;
    font-size: 0.75rem; margin-top: 3px;
  }
  .rpc-cov-green { color: var(--rpc-green); }
  .rpc-cov-amber { color: var(--rpc-amber); }
  .rpc-cov-red   { color: var(--rpc-red);   }
  .rpc-alignment-note {
    width: 100%; padding-left: 20px;
    font-size: 0.70rem; color: var(--secondary-text-color); margin-top: 2px;
  }

  /* \u2500\u2500 v1.6 \u2014 Status zone: destination + cleaned rooms + demand \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-mission-dest   { font-size: 0.80rem; color: var(--secondary-text-color); margin-top: 4px; padding-left: 2px; }
  .rpc-cleaned-rooms  { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; font-size: 0.80rem; }
  .rpc-cleaned-chip   { background: var(--secondary-background-color, #f3f4f6); border-radius: 10px; padding: 2px 8px; }
  .rpc-demand-blocked { font-size: 0.80rem; color: var(--rpc-amber); margin-top: 6px; padding-left: 2px; }

  /* \u2500\u2500 v2.0 \u2014 header: unified spatial line (F11 + C3-PROGRESS merge), recharge line \u2500\u2500 */
  .rpc-spatial-line  { font-size: 0.80rem; color: var(--secondary-text-color); margin-top: 4px; padding-left: 2px; }
  .rpc-recharge-line { font-size: 0.80rem; color: var(--rpc-amber); margin-top: 4px; padding-left: 2px; }

  /* \u2500\u2500 v2.0 \u2014 tab bar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-tab-bar {
    display: flex; gap: 2px; margin: 6px 0 4px;
    border-bottom: 1px solid var(--divider-color, rgba(0,0,0,.08));
  }
  .rpc-tab-btn {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
    background: none; border: none; cursor: pointer; font-family: inherit;
    padding: 8px 4px; font-size: 0.78rem; color: var(--secondary-text-color, #9ca3af);
    position: relative; border-bottom: 2px solid transparent;
  }
  .rpc-tab-btn--active {
    color: var(--primary-text-color); border-bottom-color: var(--primary-color, #2563eb);
    font-weight: 600;
  }
  .rpc-tab-icon  { font-size: 0.95rem; }
  .rpc-tab-label { white-space: nowrap; }
  .rpc-tab-badge {
    position: absolute; top: 4px; right: 18%;
    width: 7px; height: 7px; border-radius: 50%; background: var(--rpc-amber);
  }
  .rpc-tab-panel { padding-top: 4px; }

  /* \u2500\u2500 v1.6 \u2014 History zone: traversal row \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-traversal-row  { width: 100%; padding-left: 20px; display: flex; flex-wrap: wrap; align-items: center; gap: 3px; font-size: 0.75rem; margin-top: 3px; color: var(--secondary-text-color); }
  .rpc-trav-room      { white-space: nowrap; }
  .rpc-trav-sep       { color: var(--secondary-text-color); font-size: 0.70rem; }
  .rpc-mission-dest-popover { width: 100%; padding-left: 20px; font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 2px; }

  /* \u2500\u2500 v1.6 \u2014 Health zone: energy row \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-energy-val     { font-size: 0.82rem; color: var(--secondary-text-color); margin-left: auto; }

  /* \u2500\u2500 v1.6 \u2014 Schedule zone: optimal window \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-next-clean--optimal .rpc-schedule-time { color: var(--primary-text-color); }
  .rpc-optimal-star   { font-size: 0.70rem; color: var(--rpc-blue); margin-left: 4px; vertical-align: super; }

  /* \u2500\u2500 v1.6 \u2014 Household zone \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-zone7            { }
  .rpc-household-robot  { display: flex; align-items: baseline; gap: 8px; padding: 4px 0; font-size: 0.82rem; }
  .rpc-household-name   { font-weight: 500; min-width: 80px; }
  .rpc-household-meta   { font-size: 0.75rem; color: var(--secondary-text-color); margin-left: auto; }
  .rpc-household-combined { border-top: 1px solid var(--divider-color, rgba(0,0,0,.08)); padding-top: 6px; margin-top: 2px; }
  .rpc-household-divider  { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 4px 0; }
  .rpc-household-floors   { margin-bottom: 4px; }
  .rpc-household-floor    { display: flex; align-items: baseline; gap: 8px; font-size: 0.75rem; color: var(--secondary-text-color); padding: 2px 0; }
  .rpc-household-floor-label { font-weight: 500; }
  /* v2.0 \u2014 household view "\u2190 Back" chip */
  .rpc-household-back {
    background: none; border: none; cursor: pointer; font-family: inherit;
    color: var(--primary-color, #2563eb); font-size: 0.8rem; padding: 4px 2px 10px;
  }
`,Se=class extends HTMLElement{constructor(){super();this.robotName="";this.activeRobot="";this.activeTab=null;this.roomPickerOpen=!1;this.viewMode="robot";this.selectedRooms=new Set;this.passes="Auto";this.passSettingInFlight=!1;this.isSendingClean=!1;this.sendError=null;this.settingsPanelOpen=!1;this.loadingAction=null;this.locateTimer=null;this.actionResetTimer=null;this.cleanTimeoutTimer=null;this.openPopover=null;this.resetting=null;this.resetError=null;this.legendShown=!1;this.healthDetailsExpanded=!1;this.openMaintPopover=null;this.holdTooltipVisible=!1;this.holdToggling=!1;this.holdTooltipTimer=null;this.alertsVisible=!1;this.lastAlertHtml="";this.alertCollapseTimer=null;this.missionData=null;this.firstRecord=null;this.firstSummary=null;this.historyLoading=!1;this.historyError=null;this.openDay=null;this.dayMissions=null;this.openDaySummary=null;this.lifetimeExpanded=!1;this.hazards=[];this.historyTab="calendar";this.householdData=null;this.apiClient=null;this.prevVacuumState="";this.prevMissionActive="";this.handleOutsideClick=e=>{if(!e.composedPath().includes(this)){let o=!1;this.openPopover!==null&&(this.openPopover=null,o=!0),this.openMaintPopover!==null&&(this.openMaintPopover=null,o=!0),this.openDay!==null&&(this.openDay=null,this.dayMissions=null,this.openDaySummary=null,o=!0),o&&this.render()}};this.root=this.attachShadow({mode:"open"})}connectedCallback(){document.addEventListener("click",this.handleOutsideClick)}disconnectedCallback(){document.removeEventListener("click",this.handleOutsideClick),[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(e=>{e!==null&&clearTimeout(e)})}setConfig(e){let r=e.entities&&e.entities.length>0?e.entities:[e.entity];if(!r[0])throw new Error("roomba-plus-card: entity is required");let o=this.activeRobot,a=r.includes(o)?o:r[0],s=a!==o;this.config=e,this.activeRobot=a,this.robotName=a.replace("vacuum.",""),s&&this.resetRobotState(),this.root.innerHTML=`<style>${tt}</style><div class="rpc-card" style="padding:16px;color:var(--secondary-text-color,#9ca3af);font-size:.85rem">Loading\u2026</div>`}set hass(e){let r=this.relevantEntityIds(),o=!this._hass||r.some(c=>e.states[c]?.state!==this._hass.states[c]?.state||e.states[c]?.last_changed!==this._hass.states[c]?.last_changed),a=this._hass;this._hass=e;let s=e.states[`select.${this.robotName}_cleaning_passes`];s&&!this.isSendingClean&&!this.passSettingInFlight&&(this.passes=Te[s.state]??"Auto");let l=`binary_sensor.${this.robotName}_mission_active`,i=e.states[l]?.state??"";if(i)this.prevMissionActive==="on"&&i==="off"&&this.loadHistory(),this.prevMissionActive=i;else{let c=e.states[this.config.entity]?.state??"";this.prevVacuumState==="cleaning"&&c==="docked"&&this.loadHistory(),this.prevVacuumState=c}this.apiClient===null?this.config.show_history!==!1&&(this.apiClient=new de(e,this.config,this.activeRobot),this.loadHistory()):this.apiClient.updateHass(e),(!a||o)&&this.render()}relevantEntityIds(){let e=this.robotName;return[this.activeRobot,`sensor.${e}_last_error_code`,`sensor.${e}_last_error_zone`,`sensor.${e}_phase`,`binary_sensor.${e}_mission_active`,`binary_sensor.${e}_maintenance_due`,`sensor.${e}_readiness`,`binary_sensor.${e}_schedule_hold_active`,`sensor.${e}_next_clean`,`sensor.${e}_filter_remaining_hours`,`sensor.${e}_brush_remaining_hours`,`sensor.${e}_mop_pad`,`sensor.${e}_mop_tank_level`,`sensor.${e}_mop_behavior`,`sensor.${e}_clean_base_status`,`sensor.${e}_nav_quality`,`sensor.${e}_next_likely_clean_window`,`sensor.${e}_presence_clean_opportunities_7d`,`sensor.${e}_presence_clean_utilisation_7d`,`sensor.${e}_cleaning_passes`,`select.${e}_cleaning_passes`,`select.${e}_smart_zone_select`,`select.${e}_zone_select`,`sensor.${e}_clean_streak`,`sensor.${e}_completion_rate_30d`,`sensor.${e}_lifetime_missions`,`sensor.${e}_cleaning_analytics_30d`,`sensor.${e}_battery_capacity_retention`,`sensor.${e}_estimated_battery_eol`,`sensor.${e}_wifi_health`,`sensor.${e}_recent_coverage_pct`,`sensor.${e}_missions_last_30d`,`sensor.${e}_average_mission_time`,`sensor.${e}_cleaning_performance`,`binary_sensor.${e}_consecutive_clean_skips`,`sensor.${e}_area_cleaned_today`,`sensor.${e}_mission_expire_time`,`image.${e}_coverage_map`,`sensor.${e}_robot_health_score`,`sensor.${e}_wheel_last_cleaned`,`sensor.${e}_contact_last_cleaned`,`sensor.${e}_bin_last_cleaned`,`sensor.${e}_battery_last_replaced`,`sensor.${e}_mission_progress`,`sensor.${e}_last_mission_result`,`select.${e}_carpet_boost_select`,`switch.${e}_edge_clean`,`switch.${e}_always_finish`,`binary_sensor.${e}_demand_clean_blocked`,`sensor.${e}_optimal_clean_window`,...this.config.robot_selector_helper?[this.config.robot_selector_helper]:[]]}entityList(){return this.config.entities&&this.config.entities.length>0?this.config.entities:[this.config.entity]}resetRobotState(){this.apiClient=null,this.missionData=null,this.firstRecord=null,this.firstSummary=null,this.historyLoading=!1,this.historyError=null,this.selectedRooms=new Set,this.passes="Auto",this.passSettingInFlight=!1,this.openPopover=null,this.legendShown=!1,this.healthDetailsExpanded=!1,this.openMaintPopover=null,this.activeTab=null,this.roomPickerOpen=!1,this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.settingsPanelOpen=!1,this.lifetimeExpanded=!1,this.hazards=[],this.historyTab="calendar",this.householdData=null,this.prevVacuumState="",this.prevMissionActive="",this.alertsVisible=!1,this.lastAlertHtml="",[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(e=>{e!==null&&clearTimeout(e)})}async switchRobot(e){if(e===this.activeRobot)return;this.activeRobot=e,this.robotName=e.replace("vacuum.",""),this.resetRobotState(),this.config.show_history!==!1&&this._hass&&(this.apiClient=new de(this._hass,this.config,e),this.loadHistory()),this.render();let r=this.config.robot_selector_helper;if(r&&this._hass.states[r]){let o=r.split(".")[0],a=o==="input_select"?"select_option":"set_value",s=o==="input_select"?{entity_id:r,option:e}:{entity_id:r,value:e};try{await this._hass.callService(o,a,s)}catch(l){console.warn("roomba-plus-card: robot_selector_helper write failed",l)}}}async loadHistory(){if(!this.apiClient||this.historyLoading)return;let e=this.activeRobot;this.historyLoading=!0,this.historyError=null,this.render();try{let r=this.config.history_days??28,o=await this.apiClient.fetchSummary(r),a=await this.apiClient.fetchRecords(r);if(a.length>0){let i=new Map;for(let c of a){let p=c.started_at.slice(0,10);i.has(p)||i.set(p,[]),i.get(p).push(c)}for(let c of o){let p=i.get(c.date);p&&(c.missions=p.sort((d,g)=>d.started_at.localeCompare(g.started_at)))}}let s=await this.apiClient.fetchHazards(),l=(this.config.entities?.length??0)>=2?await this.apiClient.fetchHousehold(r):null;this.missionData=o,this.firstRecord=a.length>0?a[a.length-1]:null,this.firstSummary=o.length>0?o[o.length-1]:null,this.hazards=s,this.householdData=l}catch(r){let o=r.message;this.historyError=o==="404"?"History requires Roomba+ v1.8 or later":"History temporarily unavailable"}finally{if(this.activeRobot!==e)return;this.historyLoading=!1,this.render()}}render(){if(!this.config||!this._hass)return;let e=ge(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),r=this._hass.config?.unit_system?.length==="m",o=new Date,a=`${o.getFullYear()}-${String(o.getMonth()+1).padStart(2,"0")}-${String(o.getDate()).padStart(2,"0")}`,l=(this.missionData?.find($=>$.date===a)??null)?.total??null;this.activeTab===null&&(this.activeTab=ke(this.config,e));let i=Je(this.config,e);i.some($=>$.id===this.activeTab)||(this.activeTab=ke(this.config,e));let c=Ve(this._hass,this.config,e,this.robotName),p=c;c?(this.alertCollapseTimer!==null&&(clearTimeout(this.alertCollapseTimer),this.alertCollapseTimer=null),this.alertsVisible=!0,this.lastAlertHtml=c):this.alertsVisible&&(this.alertCollapseTimer===null&&(this.alertCollapseTimer=setTimeout(()=>{this.alertsVisible=!1,this.alertCollapseTimer=null,this.render()},100)),p=this.lastAlertHtml);let d=Ke({hass:this._hass,config:this.config,caps:e,robotName:this.robotName,loadingAction:this.loadingAction,todayMissionCount:l,missionData:this.missionData,roomPickerOpen:this.roomPickerOpen,selectedRoomCount:this.selectedRooms.size}),g=this.roomPickerOpen?ve({hass:this._hass,config:this.config,caps:e,robotName:this.robotName,selectedRooms:this.selectedRooms,passes:this.passes,isSending:this.isSendingClean,sendError:this.sendError,settingsPanelOpen:!1}):"",y={health:Qe(this._hass,e,this.robotName),history:Xe(this._hass,e,this.robotName)},k=et(i,this.activeTab,y),h="";switch(this.activeTab){case"map":h=we(this._hass,this.config,e,this.robotName,{data:this.missionData,loading:this.historyLoading,error:this.historyError,openDay:this.openDay,dayMissions:this.dayMissions,openDaySummary:this.openDaySummary,lifetimeExpanded:this.lifetimeExpanded,historyTab:"coverage",hazards:this.hazards,mapSelectedRooms:this.selectedRooms,suppressSubTabToggle:!0,isMapContext:!0},r);break;case"history":h=we(this._hass,this.config,e,this.robotName,{data:this.missionData,loading:this.historyLoading,error:this.historyError,openDay:this.openDay,dayMissions:this.dayMissions,openDaySummary:this.openDaySummary,lifetimeExpanded:this.lifetimeExpanded,historyTab:this.config.mode==="companion"?this.historyTab:"calendar",hazards:this.hazards,suppressSubTabToggle:this.config.mode!=="companion"},r);break;case"health":h=`
          ${p}
          ${Me(this._hass,this.config,e,this.robotName,{openPopover:this.openPopover,resetting:this.resetting,resetError:this.resetError,legendShown:this.legendShown,healthDetailsExpanded:this.healthDetailsExpanded,openMaintPopover:this.openMaintPopover})}
        `;break;case"settings":h=`
          ${Ae(this._hass,this.config,e,this.robotName,{holdTooltipVisible:this.holdTooltipVisible,holdToggling:this.holdToggling})}
          <div class="rpc-settings-divider"></div>
          ${fe(this._hass,this.config,this.robotName,this.settingsPanelOpen)}
          ${this.config.mode!=="companion"?ve({hass:this._hass,config:this.config,caps:e,robotName:this.robotName,selectedRooms:this.selectedRooms,passes:this.passes,isSending:this.isSendingClean,sendError:this.sendError,settingsPanelOpen:this.settingsPanelOpen,includeSettingsPanel:!1}):""}
          ${this.renderMaintenanceLinks(e)}
        `;break}let u=this.viewMode==="household"?`
        <button class="rpc-household-back" data-household-back>\u2190 Back</button>
        ${Ye(this._hass,this.config,e,this.householdData,r)}
      `:`
        ${d}
        ${g}
        ${k}
        <div class="rpc-tab-panel">
          ${h}
        </div>
      `,v=`
      <style>${tt}</style>
      <div class="rpc-card">
        ${this.renderRobotSelectorBar()}
        ${u}
      </div>
    `;this.root.innerHTML=v,this.attachEventListeners()}renderMaintenanceLinks(e){if(!e.hasMaintenanceCalendar&&!this._hass.states[`sensor.${this.robotName}_battery_capacity_retention`])return"";let r=this.robotName,o=[];return this._hass.states[`sensor.${r}_wheel_last_cleaned`]&&o.push({label:"Wheel cleaning",service:"roomba_plus.reset_wheel_cleaning",tsEntityId:`sensor.${r}_wheel_last_cleaned`}),this._hass.states[`sensor.${r}_contact_last_cleaned`]&&o.push({label:"Contact cleaning",service:"roomba_plus.reset_contact_cleaning",tsEntityId:`sensor.${r}_contact_last_cleaned`}),this._hass.states[`sensor.${r}_bin_last_cleaned`]&&o.push({label:"Bin cleaning",service:"roomba_plus.reset_bin_cleaning",tsEntityId:`sensor.${r}_bin_last_cleaned`}),this._hass.states[`sensor.${r}_battery_capacity_retention`]&&o.push({label:"Battery baseline",service:"roomba_plus.reset_battery",tsEntityId:`sensor.${r}_battery_last_replaced`}),o.length===0?"":`
      <div class="rpc-settings-divider"></div>
      <div class="rpc-zone-header">MAINTENANCE</div>
      ${o.map(a=>{let s=this._hass.states[a.tsEntityId],i=!!s&&s.state!=="unavailable"&&s.state!=="unknown"?`Reset ${G(s.state,this._hass.language)}`:"Never recorded";return`
          <div class="rpc-maint-link-row">
            <span class="rpc-maint-link-label">${a.label}</span>
            <span class="rpc-maint-link-service">${a.service}</span>
          </div>
          <div class="rpc-maint-link-lastreset">${i}</div>
        `}).join("")}
      <div class="rpc-maint-link-hint">Trigger via Developer Tools \u2192 Services</div>
    `}renderRobotSelectorBar(){let e=this.entityList();if(e.length<2)return"";let r=e.map(a=>{let s=this._hass.states[a]?.attributes?.friendly_name??a,l=this.viewMode==="robot"&&a===this.activeRobot?" selected":"";return`<option value="${a}"${l}>${s}</option>`}).join(""),o=this.viewMode==="household"?" selected":"";return`
      <div class="rpc-robot-selector">
        <select class="rpc-robot-select" data-robot-select>
          <optgroup label="My robots">${r}</optgroup>
          <optgroup label="View">
            <option value="__household__"${o}>\u{1F4CA} Household summary</option>
          </optgroup>
        </select>
      </div>`}attachEventListeners(){let e=this.root.querySelector(".rpc-card"),r=e.querySelector("[data-robot-select]");r&&r.addEventListener("change",s=>{s.stopPropagation();let l=s.target.value;l==="__household__"?(this.viewMode="household",this.render()):(this.viewMode="robot",this.switchRobot(l))}),e.querySelectorAll("[data-action]").forEach(s=>{s.addEventListener("click",l=>{l.stopPropagation(),this.handleAction(s.dataset.action)})}),e.querySelectorAll("[data-room]").forEach(s=>{s.addEventListener("click",l=>{l.stopPropagation();let i=s.dataset.room;this.selectedRooms.has(i)?this.selectedRooms.delete(i):this.selectedRooms.add(i),this.render()})}),e.querySelectorAll("[data-pass]").forEach(s=>{s.addEventListener("click",async l=>{l.stopPropagation();let i=s.dataset.pass,c=s.dataset.passOption;this.passes=i,this.render();let p=`select.${this.robotName}_cleaning_passes`;if(this._hass.states[p]){this.passSettingInFlight=!0;try{await this._hass.callService("select","select_option",{entity_id:p,option:c})}catch{}finally{this.passSettingInFlight=!1}}})}),e.querySelectorAll("[data-bar]").forEach(s=>{let l=i=>{i.stopPropagation();let c=s.dataset.bar;this.openPopover=this.openPopover===c?null:c,this.resetError=null,this.render(),!this.legendShown&&this.root.querySelector("[data-wear-legend]")&&(this.legendShown=!0)};s.addEventListener("click",l),s.addEventListener("keydown",i=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),l(i))})}),e.querySelectorAll("[data-tab]").forEach(s=>{s.addEventListener("click",l=>{l.stopPropagation();let i=s.dataset.tab;i!==this.activeTab&&(this.activeTab=i,this.render())})});let o=e.querySelector("[data-household-back]");o&&o.addEventListener("click",s=>{s.stopPropagation(),this.viewMode="robot",this.render()}),e.querySelectorAll("[data-room-poly], [data-room-label]").forEach(s=>{s.addEventListener("click",l=>{l.stopPropagation();let i=s.dataset.roomPoly??s.dataset.roomLabel;i&&(this.selectedRooms.has(i)?this.selectedRooms.delete(i):this.selectedRooms.add(i),this.render())})}),e.querySelectorAll("[data-close]").forEach(s=>{s.addEventListener("click",l=>{l.stopPropagation(),this.openPopover=null,this.render()})}),e.querySelectorAll("[data-health-details-toggle]").forEach(s=>{s.addEventListener("click",l=>{l.stopPropagation(),this.healthDetailsExpanded=!this.healthDetailsExpanded,this.render()})}),e.querySelectorAll("[data-maint]").forEach(s=>{let l=i=>{i.stopPropagation();let c=s.dataset.maint;this.openMaintPopover=this.openMaintPopover===c?null:c,this.render()};s.addEventListener("click",l),s.addEventListener("keydown",i=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),l(i))})}),e.querySelectorAll("[data-close-maint]").forEach(s=>{s.addEventListener("click",l=>{l.stopPropagation(),this.openMaintPopover=null,this.render()})}),e.querySelectorAll("[data-reset]").forEach(s=>{s.addEventListener("click",async l=>{l.stopPropagation();let i=s.dataset.reset,c=s.dataset.service;this.resetting=i,this.resetError=null,this.render();try{await this._hass.callService("roomba_plus",c,{entity_id:this.config.entity}),await new Promise(p=>setTimeout(p,800)),this.openPopover=null}catch{this.resetError=i}finally{this.resetting=null,this.render()}})}),e.querySelectorAll("[data-hold-action]").forEach(s=>{s.addEventListener("click",async l=>{if(l.stopPropagation(),s.dataset.holdAction==="tooltip")this.holdTooltipVisible=!0,this.render(),this.holdTooltipTimer!==null&&clearTimeout(this.holdTooltipTimer),this.holdTooltipTimer=setTimeout(()=>{this.holdTooltipVisible=!1,this.holdTooltipTimer=null,this.render()},3e3);else{let i=`switch.${this.robotName}_schedule_hold`,c=this._hass.states[i]?.state==="on";this.holdToggling=!0,this.render();try{await this._hass.callService("switch",c?"turn_off":"turn_on",{entity_id:i})}finally{this.holdToggling=!1,this.render()}}})});let a=e.querySelector("[data-heatmap]");a&&a.addEventListener("click",s=>{s.stopPropagation();let l=s.target.closest("[data-date]");if(!l)return;let i=l.getAttribute("data-date");this.openDay===i?(this.openDay=null,this.dayMissions=null,this.openDaySummary=null):(this.openDay=i,this.openDaySummary=this.missionData?.find(c=>c.date===i)??null,this.dayMissions=this.buildDayMissions(i)),this.render()}),e.querySelectorAll("[data-close-day]").forEach(s=>{s.addEventListener("click",l=>{l.stopPropagation(),this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.render()})}),e.querySelectorAll("[data-settings-toggle]").forEach(s=>{s.addEventListener("click",l=>{l.stopPropagation(),this.settingsPanelOpen=!this.settingsPanelOpen,this.render()})}),e.querySelectorAll("[data-switch-entity]").forEach(s=>{s.addEventListener("click",async l=>{l.stopPropagation();let i=s.dataset.switchEntity,c=this._hass.states[i]?.state==="on";try{await this._hass.callService("switch",c?"turn_off":"turn_on",{entity_id:i})}catch{}})}),e.querySelectorAll("[data-cycle-entity]").forEach(s=>{s.addEventListener("click",async l=>{l.stopPropagation();let i=s.dataset.cycleEntity,c=JSON.parse(s.dataset.cycleOptions??"[]"),p=s.dataset.cycleCurrent??"",d=c.indexOf(p),g=c.length>0?c[(d+1)%c.length]:null;if(g)try{await this._hass.callService("select","select_option",{entity_id:i,option:g})}catch{}})}),e.querySelectorAll("[data-lifetime-toggle]").forEach(s=>{s.addEventListener("click",l=>{l.stopPropagation(),this.lifetimeExpanded=!this.lifetimeExpanded,this.render()})}),e.querySelectorAll("[data-history-tab]").forEach(s=>{s.addEventListener("click",l=>{l.stopPropagation(),this.historyTab=s.dataset.historyTab,this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.render()})})}buildDayMissions(e){let r=this.missionData?.find(o=>o.date===e);return!r||r.total===0?[]:r.missions&&r.missions.length>0?r.missions:[]}async handleAction(e){let{entity:r}=this.config,o=this.robotName;if(e==="clean-selected"){this.isSendingClean=!0,this.sendError=null,this.render();let c=Array.from(this.selectedRooms);this.cleanTimeoutTimer=setTimeout(()=>{this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app",this.cleanTimeoutTimer=null,this.render()},8e3);try{let p=`select.${o}_cleaning_passes`;this.passes!=="Auto"&&this._hass.states[p]&&await this._hass.callService("select","select_option",{entity_id:p,option:be[this.passes]??this.passes}),await this._hass.callService("roomba_plus","clean_room",{entity_id:r,room_name:c,ordered:!1}),clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null,this.selectedRooms.clear(),this.isSendingClean=!1}catch{this.cleanTimeoutTimer!==null&&(clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null),this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app"}this.render();return}if(e==="repeat-last"){try{await this._hass.callService("button","press",{entity_id:`button.${o}_repeat_mission`})}catch{}return}if(e==="toggle-room-picker"){this.roomPickerOpen=!this.roomPickerOpen,this.render();return}let s={start:["vacuum","start"],pause:["vacuum","pause"],resume:["vacuum","start"],return_home:["vacuum","return_to_base"],locate:["vacuum","locate"],stop:["vacuum","stop"],retry:["vacuum","start"]}[e];if(!s)return;let[l,i]=s;if(this.loadingAction=e,this.render(),e==="locate"){this.locateTimer=setTimeout(()=>{this.loadingAction=null,this.locateTimer=null,this.render()},2e3);try{await this._hass.callService(l,i,{entity_id:r})}catch{}return}this.actionResetTimer=setTimeout(()=>{this.loadingAction=null,this.actionResetTimer=null,this.render()},5e3);try{await this._hass.callService(l,i,{entity_id:r})}finally{this.actionResetTimer!==null&&(clearTimeout(this.actionResetTimer),this.actionResetTimer=null),this.loadingAction=null,this.render()}}getCardSize(){if(!this.config||!this._hass)return 10;let e=ge(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),r=4;return e.hasSmartZones&&this.config.show_rooms!==!1&&(r+=3),this.config.show_health!==!1&&(r+=2),this.config.show_schedule!==!1&&(r+=2),this.config.show_history!==!1&&(r+=4),r}static getConfigForm(){return{schema:[{name:"entity",label:"Robot vacuum",required:!0,selector:{entity:{domain:"vacuum"}}},{name:"entities",label:"Multiple robots (overrides single robot above)",selector:{entity:{domain:"vacuum",multiple:!0}}},{name:"area_unit",label:"Area unit",selector:{select:{options:["auto","sqft","m2"],mode:"dropdown"}}},{name:"history_days",label:"History window",selector:{select:{options:[{value:7,label:"7 days"},{value:14,label:"14 days"},{value:28,label:"28 days"}],mode:"dropdown"}}},{name:"presence_entities",label:"Presence sensors (person.* entities)",selector:{entity:{domain:"person",multiple:!0}}},{name:"show_rooms",label:"Show room selector zone",selector:{boolean:{}}},{name:"show_settings",label:"Show settings panel",selector:{boolean:{}}},{name:"show_health",label:"Show health zone",selector:{boolean:{}}},{name:"show_schedule",label:"Show schedule & presence zone",selector:{boolean:{}}},{name:"show_alerts",label:"Show alerts zone",selector:{boolean:{}}},{name:"show_history",label:"Show history zone",selector:{boolean:{}}},{name:"show_lifetime",label:"Show lifetime stats",selector:{boolean:{}}},{name:"show_dirt_events",label:"Show dirt events in day detail",selector:{boolean:{}}},{name:"robot_selector_helper",label:"Robot selector helper (input_text or input_select \u2014 for xiaomi card sync)",selector:{entity:{domain:["input_text","input_select"]}}}]}}static getStubConfig(){return{entity:"vacuum.roomba"}}};typeof customElements<"u"&&customElements.define("roomba-plus-card",Se);typeof window<"u"&&(window.customCards??(window.customCards=[]),window.customCards.push({type:"roomba-plus-card",name:"Roomba+ Card",description:"Full-featured card for the roomba_plus integration",preview:!0,documentationURL:"https://github.com/johnnyh1975/ha_roomba_plus_card"}));
