function ge(e,a,t,o,s){let r=u=>!!e.states[`sensor.${a}_${u}`],n=u=>!!e.states[`select.${a}_${u}`],i=u=>!!e.states[`binary_sensor.${a}_${u}`],l=u=>!!e.states[`image.${a}_${u}`],d=r("mop_pad"),c=r("brush_remaining_hours");return{hasArea:r("area_cleaned_today"),hasBrush:c,hasPad:d,hasWater:r("mop_tank_level"),hasCleanBase:r("clean_base_status"),hasZones:n("smart_zone_select")||n("zone_select"),hasSmartZones:n("smart_zone_select"),hasProblemZone:r("problem_zone"),hasLifetimeArea:r("recent_area_30d"),hasWearRate:r("filter_wear_rate"),isMop:d&&!c,hasMissionActive:i("mission_active"),hasMissionPhase:r("phase"),hasCleaningSpeedTrend:r("cleaning_speed_trend"),hasBatteryRetention:r("battery_capacity_retention"),hasWifiFloor:r("recent_wifi_floor"),hasCoveragePct:r("recent_coverage_pct"),hasBatteryEol:r("estimated_battery_eol"),hasConsecutiveSkips:r("consecutive_clean_skips"),hasMopBehavior:r("mop_behavior"),hasCoverageImage:l("coverage_map"),hasWifiSignal:o?.wifi_signal!=null,hasRoomCoverage:o!=null&&"room_coverage"in o,hasDirtDensity:s!=null&&"dirt_density"in s,hasRobotSelectorHelper:!!t.robot_selector_helper&&!!e.states[t.robot_selector_helper],hasCleanedRooms:Array.isArray(e.states[`vacuum.${a}`]?.attributes?.last_cleaned_rooms)&&(e.states[`vacuum.${a}`]?.attributes?.last_cleaned_rooms).length>0,hasDemandBlocked:i("demand_clean_blocked"),hasEnergyConsumption:r("total_energy_consumed"),hasOptimalWindow:r("optimal_clean_window")}}var de=class{constructor(a,t,o){this.hass=a;this.entryId=null;this.entityId=o??t.entity}updateHass(a){this.hass=a}async fetchSummary(a){let o=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=summary&days=${a}`,s=await this.hass.fetchWithAuth(o);if(!s.ok)throw new Error(`${s.status}`);return s.json()}async fetchRecords(a){let o=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=records&days=${a}`,s=await this.hass.fetchWithAuth(o);return s.ok?s.json():[]}async resolveEntryId(){if(this.entryId)return this.entryId;let a=await this.hass.callWS({type:"config/entity_registry/get",entity_id:this.entityId});return this.entryId=a.config_entry_id,this.entryId}async fetchHazards(){let t=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=hazards`,o=await this.hass.fetchWithAuth(t);return o.ok?o.json():[]}async fetchHousehold(a){let t=`/api/roomba_plus/household?days=${a}`,o=await this.hass.fetchWithAuth(t);return o.ok?o.json():null}};function g(e){return String(e??"").replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}function K(e,a="en"){let t=Date.now()-new Date(e).getTime(),o=Math.floor(t/6e4);try{let s=new Intl.RelativeTimeFormat(a,{numeric:"auto"});if(o<1)return s.format(0,"minute");if(o<60)return s.format(-o,"minute");let r=Math.floor(o/60);if(r<24)return s.format(-r,"hour");let n=Math.floor(r/24);return n<30?s.format(-n,"day"):s.format(-Math.floor(n/30),"month")}catch{if(o<1)return"just now";if(o<60)return`${o}m ago`;let s=Math.floor(o/60);return s<24?`${s}h ago`:`${Math.floor(s/24)}d ago`}}var ce={sofa:"\u{1F6CB}\uFE0F",bed:"\u{1F6CF}\uFE0F","bed-double":"\u{1F6CF}\uFE0F","silverware-fork-knife":"\u{1F37D}\uFE0F",stove:"\u{1F373}",microwave:"\u{1F4E6}",fridge:"\u{1F9CA}",toilet:"\u{1F6BD}",shower:"\u{1F6BF}",bathtub:"\u{1F6C1}",desk:"\u{1F5A5}\uFE0F","chair-rolling":"\u{1F4BA}",television:"\u{1F4FA}",bookshelf:"\u{1F4DA}",wardrobe:"\u{1F454}",home:"\u{1F3E0}",garage:"\u{1F697}",door:"\u{1F6AA}",stairs:"\u{1FA9C}",balcony:"\u{1F305}",pool:"\u{1F3CA}","washing-machine":"\u{1FAE7}",hanger:"\u{1F9F9}","baby-carriage":"\u{1F37C}",dog:"\u{1F415}",cat:"\u{1F408}","floor-plan":"\u{1F4D0}","map-marker":"\u{1F4CD}",star:"\u2B50",heart:"\u2764\uFE0F","office-building":"\u{1F3E2}",school:"\u{1F3EB}"},xe="\u{1F4CD}";var fe={Auto:"Auto","\xD71":"One pass","\xD72":"Two passes"},$e={Auto:"Auto","One pass":"\xD71","Two passes":"\xD72"};function ve(e,a,t,o,s=!1){if(a.show_settings===!1)return"";let r=t,n=e.states[`switch.${r}_edge_clean`],i=e.states[`switch.${r}_always_finish`],l=e.states[`select.${r}_carpet_boost_mode`];if(!n&&!i&&!l)return"";let d="";if(o){let m=n?.state==="on",f=i?.state==="on",$=l?l.attributes.options??[]:[];d=`
      <div class="rpc-settings-panel">
        ${n?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Edge clean</span>
            <button class="rpc-setting-toggle${m?" rpc-setting-on":""}"
                    data-switch-entity="switch.${r}_edge_clean"
                    aria-pressed="${m}">
              ${m?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${i?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Always finish</span>
            <button class="rpc-setting-toggle${f?" rpc-setting-on":""}"
                    data-switch-entity="switch.${r}_always_finish"
                    aria-pressed="${f}">
              ${f?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${l?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Carpet boost</span>
            <button class="rpc-setting-cycle"
                    data-cycle-entity="select.${r}_carpet_boost_mode"
                    data-cycle-options="${g(JSON.stringify($))}"
                    data-cycle-current="${g(l.state)}">
              ${g(l.state)} \u25BC
            </button>
          </div>`:""}
      </div>
    `}return`
    ${s?'<div class="rpc-settings-divider rpc-settings-divider--compact"></div>':'<div class="rpc-settings-divider"></div>'}
    ${s?'<div class="rpc-zone-header rpc-controls-label">CONTROLS</div>':""}
    <button class="rpc-settings-row" data-settings-toggle aria-expanded="${o}">
      <span class="rpc-settings-icon">\u2699</span>
      <span class="rpc-settings-label">Settings</span>
      <span class="rpc-settings-arrow">${o?"\u25B2":"\u25BC"}</span>
    </button>
    ${d}
  `}function we(e){let{hass:a,config:t,caps:o,robotName:s,selectedRooms:r,passes:n,isSending:i,sendError:l,settingsPanelOpen:d}=e;if(!o.hasZones||t.show_rooms===!1)return"";let c=s,u=a.states[`select.${c}_smart_zone_select`],m=a.states[`select.${c}_zone_select`],f=u??m;if(!f)return"";let $=f.attributes.options??[];if($.length===0)return"";let p=a.states[`button.${c}_repeat_mission`],h=!!p&&p.state!=="unavailable",v=a.states[`select.${c}_cleaning_passes`],y=o.isMop?"\u25B6 Mop selected rooms":"\u25B6 Clean selected rooms",x=r.size,k='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',C=(()=>{let H=o.hasSmartZones?`select.${s}_smart_zone_select`:`select.${s}_zone_select`,M=a.states[H]?.attributes?.region_icons;return M&&typeof M=="object"&&!Array.isArray(M)?M:{}})(),S=$.map(H=>{let M=r.has(H),Y=C[H],ae=Y?ce[Y]??xe:"",A=ae?`${ae} ${g(H)}`:g(H);return`<button class="rpc-room-chip${M?" rpc-room-chip--selected":""}"
      data-room="${g(H)}" aria-pressed="${M}">${A}</button>`}).join(""),T="";if(v){let H=n;T=`
      <div class="rpc-passes-row">
        <span class="rpc-passes-label">Passes:</span>
        ${["Auto","\xD71","\xD72"].map(M=>`<button class="rpc-pass-chip${H===M?" rpc-pass-chip--selected":""}"
            data-pass="${M}"
            data-pass-option="${g(fe[M]??M)}">${M}</button>`).join("")}
      </div>
    `}let O=ve(a,t,s,d);return`
    <div class="rpc-zone rpc-zone2">
      <div class="rpc-zone-header">ROOMS</div>
      <div class="rpc-chips-row">
        ${S}
        ${x>0?`<span class="rpc-selected-count">${x} selected</span>`:""}
      </div>
      ${T}
      <div class="rpc-room-actions">
        <button class="rpc-btn rpc-btn-primary${x===0||i?" rpc-btn-disabled":""}"
                data-action="clean-selected"
                ${x===0||i?"disabled":""}
                aria-label="${y}">
          ${i?k+" Sending\u2026":y}
        </button>
        ${h?'<button class="rpc-btn-text" data-action="repeat-last">\u21A9 Repeat last</button>':""}
      </div>
      ${l?`<div class="rpc-send-error">${g(l)}</div>`:""}
      ${O}
    </div>
  `}function se(e,a){return e.states[a]?.state??"unavailable"}function ke(e,a,t){return a==="m2"||a==="auto"&&t?`${Math.round(e*.0929)} m\xB2`:`${e} ft\xB2`}function Ye(e,a){if(!e)return null;for(let t=e.length-1;t>=0;t--){let o=e[t];if(o.missions&&o.missions.length>0)for(let s=o.missions.length-1;s>=0;s--){let r=o.missions[s];if(r.result==="completed")return K(r.started_at,a)}else if(o.completed>0)return K(o.date+"T12:00:00Z",a)}return null}function Je(e){let a=["th","st","nd","rd"],t=e%100;return e+(a[(t-20)%10]??a[t]??a[0])}function Se(e){let{hass:a,config:t,caps:o,robotName:s,loadingAction:r,todayMissionCount:n,settingsPanelOpen:i}=e,l=t.entity,d=se(a,l),c=a.states[l]?.attributes??{},u=a.config?.unit_system?.length==="m",m=t.area_unit??"auto",f=d==="unavailable",$=r!==null,p=s,h=`sensor.${p}_last_error_code`,v=`sensor.${p}_last_error_zone`,w=`sensor.${p}_mission_recharge_time`,y=`sensor.${p}_average_mission_time`,x=`sensor.${p}_area_cleaned_today`,k=c.mission_elapsed_min??null,C=c.mission_area_sqft??null,S=parseFloat(se(a,y)),T=isNaN(S)||S<=0?45:S,O=o.isMop,H=O?"\u{1F9F9}":"\u{1F916}",M=g(c.friendly_name??l),Y=a.states[`sensor.${p}_phase`]?.state??"",A=(a.states[`binary_sensor.${p}_mission_active`]?.state??"")==="on",z=o.hasMissionActive,E=a.states[`sensor.${p}_mission_expire_time`]?.state??"",R=E&&E!=="unavailable"&&E!=="unknown"?new Date(E):null,F=!!R&&!isNaN(R.getTime())&&R>new Date,Z=F?Math.max(1,Math.round((R.getTime()-Date.now())/6e4)):null,_=!1;if(z)_=d==="docked"&&A;else{let b=se(a,w);_=d==="docked"&&(b!=="unavailable"&&b!=="unknown"&&E!=="unavailable"&&E!=="unknown")&&F}let D="",N="",Q="";if(Y==="evac")D="\u2B06",N="Emptying bin";else if(_)D="\u26A1",N=Z!==null?`Recharging \u2014 resuming in ~${Z} min`:"Recharging \u2014 mission continues";else switch(d){case"cleaning":D="\u25CF",N=O?"Mopping":"Cleaning";break;case"paused":D="\u23F8",N="Paused";break;case"returning":D="\u21A9",N="Returning to dock";break;case"docked":D="\u2713",N="Docked";break;case"idle":D="\u25CB",N="Idle";break;case"error":D="\u26A0",N="Error",Q="rpc-error-state";break;case"unavailable":D="\u2014",N="Unavailable";break}let oe="";if(d==="error"){let b=a.states[h];if(b&&b.state!=="0"&&b.state!==""&&b.state!=="unavailable"){let L=g(b.attributes.description??"Unknown error"),j=g(b.attributes.action??""),I=se(a,v),U=I&&I!=="unknown"&&I!=="unavailable";N=`Error ${g(b.state)} \u2014 ${L}`,oe=`
        ${j?`<div class="rpc-error-action">${j}</div>`:""}
        ${U?`<div class="rpc-error-zone">Zone: ${g(I)}</div>`:""}
      `}else N="Robot error \u2014 check the iRobot app"}let ne="";if((z?A:d==="cleaning"||_)&&o.hasArea){let b=parseFloat(se(a,x));if(!isNaN(b)&&b>0){let L=ke(b,m,u),j=n!==null?n+1:null,I=j!==null&&j>1?` \xB7 ${g(Je(j))} mission`:"";ne=`<div class="rpc-area-today">${L} already today${I}</div>`}}let ie="";d==="cleaning"&&k!==null&&(ie=`<div class="rpc-progress-track"><div class="rpc-progress-fill" style="width:${Math.min(k/T*100,95)}%"></div></div>`);let X="";if(d==="cleaning"){let b=[];if(k!==null){let L=Math.max(0,Math.round(T-k));b.push(`<div class="rpc-metric"><span class="rpc-metric-val">~${L} min</span><span class="rpc-metric-lbl">Remaining</span></div>`)}if(o.hasArea&&C!==null){b.push(`<div class="rpc-metric"><span class="rpc-metric-val">${ke(C,m,u)}</span><span class="rpc-metric-lbl">Cleaned</span></div>`);let L=parseFloat(se(a,`sensor.${p}_recent_area_30d`)),j=parseFloat(se(a,`sensor.${p}_missions_last_30d`)),I=!isNaN(L)&&!isNaN(j)&&j>=5?L/j:NaN;if(!isNaN(I)&&I>0){let U=Math.round((C-I)/I*100),he=U>=0?"\u25B2":"\u25BC",Ue=U>=0?"rpc-delta-up":"rpc-delta-down";b.push(`<div class="rpc-metric"><span class="rpc-metric-val ${Ue}">${he} ${Math.abs(U)}%</span><span class="rpc-metric-lbl">vs usual</span></div>`)}}b.length&&(X=`<div class="rpc-metrics-row">${b.join("")}</div>`)}let ee="";if(d==="docked"&&!_){let b=Ye(e.missionData,a.language);if(b)ee=`<div class="rpc-docked-since">Last cleaned: ${b}</div>`;else{let L=a.states[l]?.last_changed;L&&(ee=`<div class="rpc-docked-since">Last mission: ${K(L,a.language)}</div>`)}}let P=c.mission_destination,te=d==="cleaning"&&P?`<div class="rpc-mission-dest">\u2192 Targeting: ${g(P)}</div>`:"",le="";o.hasDemandBlocked&&a.states[`binary_sensor.${p}_demand_clean_blocked`]?.state==="on"&&(le='<div class="rpc-demand-blocked">\u{1F9F9} Floor needs cleaning \u2014 waiting for home to be empty</div>');let re="";if(o.hasCleanedRooms&&(d==="docked"||d==="idle")&&!_){let b=c.last_cleaned_rooms,L=c.region_icons;b&&b.length>0&&(re=`<div class="rpc-cleaned-rooms">${b.map(I=>{let U=L?.[I],he=U?ce[U]??"":"";return`<span class="rpc-cleaned-chip">${he?he+"\xA0":""}${g(I)}</span>`}).join("")}</div>`)}let me='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',B=(b,L,j)=>{let I=r===b;return`<button class="rpc-btn${I?" rpc-btn-loading":""}"
      data-action="${b}"
      ${f||$?"disabled":""}
      aria-label="${L}">
      ${I?me:j}
    </button>`},W="";d==="cleaning"||Y==="evac"?W=B("pause","Pause","\u23F8 Pause")+B("return_home","Return home","\u21A9 Return home"):d==="paused"?W=B("resume","Resume","\u25B6 Resume")+B("return_home","Return home","\u21A9 Return home"):_?W=B("return_home","Cancel mission","\u2715 Cancel mission"):d!=="returning"&&!f&&(W=B("start","Start","\u25B6 Start")+B("locate","Locate","\u2299 Locate"));let V=t.show_rooms!==!1;if(!V){let b=a.states[`button.${s}_repeat_mission`];!!b&&b.state!=="unavailable"&&(W+='<button class="rpc-btn-text" data-action="repeat-last">\u21A9 Repeat last</button>')}let J=V?"":ve(a,t,s,i,!0);return`
    <div class="rpc-zone rpc-zone1${Q?" "+Q:""}">
      <div class="rpc-robot-identity">
        <span class="rpc-robot-icon">${H}</span>
        <span class="rpc-robot-name">${M}</span>
      </div>
      <div class="rpc-state-row">
        <span class="rpc-state-dot rpc-state-${d}">${D}</span>
        <span class="rpc-state-label">${N}</span>
      </div>
      ${ne}
      ${oe}
      ${ie}
      ${te}
      ${X}
      ${ee}
      ${le}
      ${re}
      ${W?`<div class="rpc-actions">${W}</div>`:""}
      ${J}
    </div>
  `}function Ce(e,a){return Math.min(100,Math.max(0,Math.round(e/a*100)))}function Te(e,a){return a==="battery"?e>20?"var(--rpc-green)":e>10?"var(--rpc-amber)":"var(--rpc-red)":a==="tank"?e>40?"var(--rpc-green)":e>20?"var(--rpc-amber)":"var(--rpc-red)":e>50?"var(--rpc-green)":e>10?"var(--rpc-amber)":"var(--rpc-red)"}function Ke(e,a){let t=a/90;if(!t)return"";let o=e/t;return o>1.2?"\u2191":o<.8?"\u2193":"\u2192"}function ze(e){let a=parseInt(e,10);return!isNaN(a)&&a>=0?`~${a} use${a!==1?"s":""} remaining`:e==="Empty"?"Bag full \u2014 replace soon":e==="Full"?"Bag has capacity":g(e)}function Ee(e,a,t,o,s){if(a.show_health===!1)return"";let r=o,n=[];e.states[`sensor.${r}_filter_remaining_hours`]&&n.push({key:"filter",label:"Filter",sensorId:`sensor.${r}_filter_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:t.hasWearRate?`sensor.${r}_filter_wear_rate`:void 0,resetService:"reset_filter",lastReplacedId:`sensor.${r}_filter_last_replaced`}),t.hasBrush&&e.states[`sensor.${r}_brush_remaining_hours`]&&n.push({key:"brush",label:"Brush",sensorId:`sensor.${r}_brush_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:t.hasWearRate?`sensor.${r}_brush_wear_rate`:void 0,resetService:"reset_brush",lastReplacedId:`sensor.${r}_brush_last_replaced`}),t.hasPad&&e.states[`sensor.${r}_pad_days_until_due`]&&n.push({key:"pad",label:"Pad",sensorId:`sensor.${r}_pad_days_until_due`,thresholdAttr:"threshold_days",type:"consumable",unit:"d",wearSensorId:t.hasWearRate?`sensor.${r}_pad_wear_rate`:void 0,resetService:"reset_pad",lastReplacedId:`sensor.${r}_pad_last_replaced`}),t.hasWater&&e.states[`sensor.${r}_mop_tank_level`]&&n.push({key:"tank",label:"Tank",sensorId:`sensor.${r}_mop_tank_level`,thresholdAttr:null,type:"tank"});let i=e.states[`sensor.${r}_battery`]?`sensor.${r}_battery`:null,l=i?void 0:e.states[`vacuum.${r}`]?.attributes?.battery_level;if((i||l!==void 0)&&n.push({key:"battery",label:"Battery",sensorId:i??"",thresholdAttr:null,type:"battery",rawPct:l}),t.hasCleanBase&&e.states[`sensor.${r}_clean_base_status`]&&n.push({key:"cleanbase",label:"Clean Base",sensorId:`sensor.${r}_clean_base_status`,thresholdAttr:null,type:"cleanbase"}),n.length===0)return"";let d=n.map(p=>Ge(p,e,r,s)).join(""),c="";if(t.hasBatteryRetention){let p=e.states[`sensor.${r}_battery_capacity_retention`];if(p&&p.state!=="unavailable"&&p.state!=="unknown"){let h=Math.round(parseFloat(p.state));if(!isNaN(h)){let v=h>85?"var(--rpc-green)":h>70?"var(--rpc-amber)":"var(--rpc-red)",w=e.states[`sensor.${r}_battery_cycles`],y=w?parseInt(w.state,10):NaN,x=isNaN(y)?"":`${y} charge cycle${y!==1?"s":""}`,k="";if(t.hasBatteryEol){let T=e.states[`sensor.${r}_estimated_battery_eol`];if(T&&T.state!=="unavailable"&&T.state!=="unknown"){let O=parseInt(T.state,10);isNaN(O)||(k=O>0?`<div class="rpc-retention-eol">Battery life: ~${O} days remaining</div>`:'<div class="rpc-retention-eol rpc-retention-eol--warn">Consider replacing \u2014 battery at end of life</div>')}}let C=s.openPopover==="retention",S=C?`
          <div class="rpc-popover">
            <div class="rpc-popover-header">
              <span>Battery Health</span>
              <button class="rpc-popover-close" data-close="retention" aria-label="Close">\xD7</button>
            </div>
            <div class="rpc-popover-divider"></div>
            <div class="rpc-popover-body">
              <div>${h}% of original capacity</div>
              ${x?`<div class="rpc-popover-sub">${x}</div>`:""}
              ${k}
            </div>
          </div>`:"";c=`
          <div class="rpc-bar-row" data-bar="retention" role="button" aria-expanded="${C}" tabindex="0"
               aria-label="Bat. Health \u2014 ${h}%">
            <span class="rpc-bar-label">Bat. Health</span>
            <span class="rpc-bar-track"><span class="rpc-bar-fill" style="width:${h}%;background:${v}"></span></span>
            <span class="rpc-bar-pct" style="color:${v}">${h}%</span>
          </div>
          ${S}`}}}let u="";if(t.hasCoveragePct){let p=e.states[`sensor.${r}_recent_coverage_pct`];if(p&&p.state!=="unavailable"&&p.state!=="unknown"){let h=e.states[`sensor.${r}_missions_last_30d`],v=h?parseInt(h.state,10):NaN;if(isNaN(v)||v<10)u=`
          <div class="rpc-bar-row rpc-bar-row--static">
            <span class="rpc-bar-label">Coverage</span>
            <span class="rpc-coverage-building">Building history\u2026</span>
          </div>`;else{let w=Math.min(100,Math.round(parseFloat(p.state)));if(!isNaN(w)){let y=w>=85?"var(--rpc-green)":w>=65?"var(--rpc-amber)":"var(--rpc-red)",x=s.openPopover==="coverage",k=isNaN(v)?"":`Based on ${v} mission${v!==1?"s":""} in the last 30 days.`,C=x?`
            <div class="rpc-popover">
              <div class="rpc-popover-header">
                <span>Floor Coverage</span>
                <button class="rpc-popover-close" data-close="coverage" aria-label="Close">\xD7</button>
              </div>
              <div class="rpc-popover-divider"></div>
              <div class="rpc-popover-body">
                <div>${w}% of floor area covered on the last mission.</div>
                ${k?`<div class="rpc-popover-sub">${k}</div>`:""}
                <div class="rpc-popover-sub">Low coverage may indicate obstacles, map drift, or a missed room.</div>
              </div>
            </div>`:"";u=`
            <div class="rpc-bar-row" data-bar="coverage" role="button" aria-expanded="${x}" tabindex="0"
                 aria-label="Coverage ${w}% last mission">
              <span class="rpc-bar-label">Coverage</span>
              <span class="rpc-bar-track"><span class="rpc-bar-fill" style="width:${w}%;background:${y}"></span></span>
              <span class="rpc-bar-pct" style="color:${y}">${w}%</span>
              <span class="rpc-bar-hours">last mission</span>
            </div>
            ${C}`}}}}let m=c||u?`<div class="rpc-health-battery-sep"></div>${c}${u}`:"",f="";if(t.hasEnergyConsumption){let p=e.states[`sensor.${r}_total_energy_consumed`];if(p&&p.state!=="unavailable"&&p.state!=="unknown"){let h=parseFloat(p.state);if(!isNaN(h)){let v=e.states[`sensor.${r}_battery_cycles`],w=v?parseInt(v.state,10):NaN,y=s.openPopover==="energy",x=y?`
          <div class="rpc-popover">
            <div class="rpc-popover-header">
              <span>Energy</span>
              <button class="rpc-popover-close" data-close="energy" aria-label="Close">\xD7</button>
            </div>
            <div class="rpc-popover-divider"></div>
            <div class="rpc-popover-body">
              <div>~${h.toFixed(1)} kWh used${isNaN(w)?"":` over ${w} charge cycles`}</div>
              <div class="rpc-popover-sub">Estimated from battery capacity and cycle count.</div>
              <div class="rpc-popover-sub">Connect to the HA Energy dashboard for home-wide monitoring.</div>
            </div>
          </div>`:"";f=`
          <div class="rpc-bar-row" data-bar="energy" role="button" aria-expanded="${y}" tabindex="0"
               aria-label="Lifetime energy ~${h.toFixed(1)} kWh">
            <span class="rpc-bar-label">Energy</span>
            <span class="rpc-energy-val">~${h.toFixed(1)} kWh lifetime</span>
          </div>
          ${x}`}}}let $="";if(t.isMop){let p=e.states[`sensor.${r}_mop_pad`],h=t.hasMopBehavior?e.states[`sensor.${r}_mop_behavior`]:null,v=[];p&&p.state!=="unknown"&&p.state!=="unavailable"&&v.push(g(p.state)),h&&h.state!=="unknown"&&h.state!=="unavailable"&&v.push(`${g(h.state)} intensity`),v.length&&($=`
        <div class="rpc-health-divider"></div>
        <div class="rpc-mop-config">${v.join(" \xB7 ")}</div>
      `)}return`
    <div class="rpc-zone rpc-zone3">
      <div class="rpc-zone-header">HEALTH</div>
      ${d}
      ${m}
      ${f}
      ${$}
    </div>
  `}function Ge(e,a,t,o){let s=o.openPopover===e.key;if(e.type==="cleanbase"){let m=a.states[e.sensorId];return m?`
      <div class="rpc-bar-row" data-bar="${e.key}" role="button" aria-expanded="${s}" tabindex="0"
           aria-label="${e.label}">
        <span class="rpc-bar-label">${e.label}</span>
        <span class="rpc-bar-cleanbase-state">${ze(m.state)}</span>
      </div>
      ${s?Xe(e.label,m.state):""}
    `:""}let r=0,n="",i="",l=null;if(e.rawPct!==void 0)r=Math.min(100,Math.max(0,e.rawPct)),n=`${Math.round(r)}%`;else{let m=a.states[e.sensorId];if(!m)return"";let f=parseFloat(m.state);if(isNaN(f))return"";if(e.type==="tank"||e.type==="battery")r=Math.min(100,Math.max(0,f)),n=`${Math.round(r)}%`;else{if(l=e.thresholdAttr?m.attributes[e.thresholdAttr]:null,!l)return"";r=Ce(f,l),n=`${r}%`,i=`${Math.round(f)}h`}}let d=Te(r,e.type),c="";if(e.wearSensorId&&l){let m=a.states[e.wearSensorId];m&&m.state!=="unknown"&&m.state!=="unavailable"&&(c=Ke(parseFloat(m.state),l))}let u=e.rawPct!==void 0?{state:String(Math.round(e.rawPct)),attributes:{}}:a.states[e.sensorId];return`
    <div class="rpc-bar-row" data-bar="${e.key}" role="button" aria-expanded="${s}" tabindex="0"
         aria-label="${e.label} \u2014 ${n}">
      <span class="rpc-bar-label">${e.label}</span>
      <div class="rpc-bar-track">
        <div class="rpc-bar-fill" style="width:${r}%;background:${d}"></div>
      </div>
      <span class="rpc-bar-pct" style="color:${d}">${n}</span>
      ${i?`<span class="rpc-bar-hours">${i}</span>`:""}
      ${c?`<span class="rpc-bar-arrow" style="color:${d}">${c}</span>`:""}
    </div>
    ${s&&u?Qe(e,u,l,a,o):""}
  `}function Qe(e,a,t,o,s){let r=parseFloat(a.state),n=t?Ce(r,t):Math.min(100,Math.max(0,r)),i=Te(n,e.type),l=s.resetting===e.key,d=e.lastReplacedId?o.states[e.lastReplacedId]:null,c="";d&&d.state!=="unavailable"&&d.state!=="unknown"&&(c=`
      <div class="rpc-popover-row">
        <span>Last replaced</span>
        <span>${new Date(d.state).toLocaleDateString(o.language)} (${K(d.state,o.language)})</span>
      </div>`);let u="";if(e.wearSensorId&&!s.legendShown){let f=o.states[e.wearSensorId];f&&f.state!=="unknown"&&f.state!=="unavailable"&&(u=`
        <div class="rpc-wear-legend" data-wear-legend>
          <span class="rpc-wear-legend-title">Wear trend</span>
          <span>\u2191 wearing faster than normal</span>
          <span>\u2192 wearing at normal rate</span>
          <span>\u2193 wearing slower than normal</span>
        </div>`)}return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${g(e.label)}</span>
        <button class="rpc-popover-close" data-close="${e.key}" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      ${c}
      ${t?`<div class="rpc-popover-row"><span>Threshold</span><span>${t} ${e.unit??"h"}</span></div>`:""}
      ${t?`<div class="rpc-popover-row"><span>Remaining</span><span>${Math.round(r)} ${e.unit??"h"} (${n}%)</span></div>`:""}
      <div class="rpc-popover-bar-track">
        <div class="rpc-popover-bar-fill" style="width:${n}%;background:${i}"></div>
      </div>
      ${u}
      ${e.resetService?`
        <button class="rpc-btn rpc-btn-secondary${l?" rpc-btn-loading":""}"
                data-reset="${e.key}" data-service="${e.resetService}"
                ${l?"disabled":""}>
          ${l?'<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':"Mark as replaced"}
        </button>
        ${s.resetError===e.key?'<div class="rpc-send-error">Reset failed \u2014 try again</div>':""}
      `:""}
    </div>
  `}function Xe(e,a){return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${g(e)}</span>
        <button class="rpc-popover-close" data-close="cleanbase" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      <div class="rpc-popover-row"><span>Status</span><span>${ze(a)}</span></div>
      <div class="rpc-popover-row"><span>Function</span><span>Auto-empties bin after missions</span></div>
    </div>
  `}function Re(e,a){if(!e||e==="unavailable"||e==="unknown")return"No schedule set";try{let t=new Date(e);return t.toLocaleDateString(a,{weekday:"short"})+" "+t.toLocaleTimeString(a,{hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return g(e)}}function et(e,a){if(!e||e==="unavailable"||e==="unknown")return"";try{let t=new Date(e);if(isNaN(t.getTime()))return"";let o=t.toLocaleDateString(a,{weekday:"short"}),s=t.toLocaleTimeString(a,{hour:"2-digit",minute:"2-digit",hour12:!1});return`${o} ~${s}`}catch{return""}}function He(e,a,t,o,s){if(a.show_schedule===!1)return"";let r=o,n=e.states[`sensor.${r}_next_clean`],i=e.states[`binary_sensor.${r}_schedule_hold_active`],l=e.states[`sensor.${r}_presence_clean_opportunities_7d`],d=e.states[`sensor.${r}_presence_clean_utilisation_7d`],c=e.states[`sensor.${r}_next_likely_clean_window`],u=!!l&&!!d&&l.state!=="unknown"&&l.state!=="unavailable"&&d.state!=="unknown"&&d.state!=="unavailable",m=!!c&&c.state!=="unknown"&&c.state!=="unavailable";if(!n&&!i&&!u&&!m&&!t.hasOptimalWindow)return"";let f="";if(i){let y=i.state==="on",k=i.attributes.source==="presence_manager",C="rpc-badge-green",S="Schedule active",T="";y&&(k?(C="rpc-badge-blue",S="Away hold",T="\u{1F3C3}"):(C="rpc-badge-amber",S="Hold active",T="\u{1F512}")),f=`
      <button class="rpc-hold-badge ${C}"
              data-hold-action="${k?"tooltip":"toggle"}"
              aria-label="${g(S)}">
        ${s.holdToggling?'<svg class="rpc-spinner rpc-spinner-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':`${T} ${S}`}
      </button>
      ${s.holdTooltipVisible?`
        <div class="rpc-hold-tooltip" role="status">
          Schedule managed by presence automation \u2014 controlled automatically
        </div>`:""}
    `}let $="";if(m){let y=et(c.state,e.language);y&&($=`
        <div class="rpc-next-clean rpc-next-clean--likely">
          <span class="rpc-schedule-label">Next likely window</span>
          <span class="rpc-schedule-time rpc-schedule-time--approx">${y}</span>
        </div>
      `)}let p="";if(t.hasOptimalWindow){let y=e.states[`sensor.${r}_optimal_clean_window`];if(y&&y.state!=="unavailable"&&y.state!=="unknown"){let x=Re(y.state,e.language);x&&x!=="No schedule set"&&(p=`
          <div class="rpc-next-clean rpc-next-clean--optimal">
            <span class="rpc-schedule-label">Optimal window</span>
            <span class="rpc-schedule-time">
              ${x}
              <span class="rpc-optimal-star" title="Analytically derived from cleaning history">\u2605</span>
            </span>
          </div>`)}}let h="",v=a.presence_entities??[];if(v.length>0){let y=v.map(x=>{let k=e.states[x];if(!k)return"";let C=k.state==="home",S=k.attributes.friendly_name??x,T=g(S.split(" ")[0]);return`<span class="rpc-presence-dot">
        <span class="rpc-dot ${C?"rpc-dot-amber":"rpc-dot-green"}" aria-hidden="true"></span>
        ${T}
        <span class="rpc-presence-label">${C?"home":"away"}</span>
      </span>`}).join("");y&&(h=`<div class="rpc-presence-row">${y}</div>`)}let w="";if(u){let y=parseInt(l.state,10),x=parseInt(d.state,10);if(!isNaN(y)&&!isNaN(x)){let k=d.attributes.cleans_7d,C=k??Math.round(y*x/100),S=`${y} opportunit${y!==1?"ies":"y"} this week`;w=`
        <div class="rpc-presence-analytics" aria-label="Presence cleaning analytics">
          ${`${C} clean${C!==1?"s":""}`} \xB7 ${S}
        </div>
      `}}return`
    <div class="rpc-zone rpc-zone4">
      <div class="rpc-zone-header">SCHEDULE &amp; PRESENCE</div>
      <div class="rpc-schedule-row">
        <div class="rpc-schedule-times">
          ${n?`
            <div class="rpc-next-clean">
              <span class="rpc-schedule-label">Next scheduled</span>
              <span class="rpc-schedule-time">${Re(n.state,e.language)}</span>
            </div>`:""}
          ${$}
          ${p}
        </div>
        ${f}
      </div>
      ${h}
      ${w}
    </div>
  `}var Me={completed:"#2d9c4f",stuck:"#d97706",error:"#dc2626",cancelled:"#9ca3af",none:"var(--rpc-cell-empty, var(--rpc-grey-light, #e5e7eb))"},q=24,be=2,pe=20,ye=18,G=q+be;function De(e=7){return pe+e*G-be}function Ne(e){return ye+e*G-be+4}function tt(e,a){return e.toLocaleDateString(a,{month:"short",day:"numeric"})}function Ae(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function Pe(e,a,t,o="en-US",s=!1){let r=new Map;for(let p of e)r.set(p.date,p);let n=new Date,i=new Date(n);i.setDate(n.getDate()-(a-1));let l=(i.getDay()+6)%7;i.setDate(i.getDate()-l);let d=Math.ceil((a+l)/7),c=[];for(let p=0;p<d;p++)for(let h=0;h<7;h++){let v=new Date(i);v.setDate(i.getDate()+p*7+h),!(v>n)&&c.push({date:v,summary:r.get(Ae(v))??null,col:h,row:p})}let u=De(),m=Ne(d),f=["Mo","Tu","We","Th","Fr","Sa","Su"],$=`<svg width="${u}" height="${m}" viewBox="0 0 ${u} ${m}" xmlns="http://www.w3.org/2000/svg" role="grid" aria-label="Cleaning history heatmap">`;for(let p=0;p<7;p++){let h=pe+p*G+q/2;$+=`<text x="${h}" y="13" text-anchor="middle" font-size="9" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${f[p]}</text>`}for(let p of c){let h=pe+p.col*G,v=ye+p.row*G,w=p.summary?.result??"none",y=Me[w]??Me.none,x=p.summary?.total??0,k=tt(p.date,o);if(x===0?k+=": no missions":x===1?k+=`: 1 mission, ${w}`:k+=`: ${x} missions, ${w}`,p.col===0){let S=p.date.getDate();$+=`<text x="${pe-3}" y="${v+q/2+3}" text-anchor="end" font-size="9" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${S}</text>`}let C="";if(s&&p.summary?.relative_to_baseline!=null){let S=p.summary.relative_to_baseline;C=` opacity="${Math.min(1,Math.max(.5,.5+S/4)).toFixed(2)}"`}if($+=`<g role="gridcell" aria-label="${k}" data-date="${Ae(p.date)}" data-result="${w}" data-total="${x}" style="cursor:pointer">`,$+=`<rect x="${h-2}" y="${v-2}" width="${q+4}" height="${q+4}" fill="transparent" rx="4"/>`,$+=`<rect x="${h}" y="${v}" width="${q}" height="${q}" fill="${y}" rx="3"${C}/>`,x>1){let S=Math.min(x,3);for(let T=0;T<S;T++){let O=h+q-4-T*5,H=v+q-3;$+=`<circle cx="${O}" cy="${H}" r="2" fill="rgba(255,255,255,0.75)"/>`}}$+="</g>"}return $+="</svg>",$}function Le(e){return!e||e.length===0?[]:e.length===5?e:e.every(t=>t<=4)?e.map(t=>t*25):e}function Ie(e,a,t,o,s,r){let n=((e-t)/(o-t)*100).toFixed(1)+"%",i=((r-a)/(r-s)*100).toFixed(1)+"%";return{left:n,top:i}}function Be(e){return e<=4?e*25:e}function Oe(e,a){if(!e||e.length===0)return"";let t=7,o=e.length<=t?[...e]:Array.from({length:t},(m,f)=>e[Math.round(f/(t-1)*(e.length-1))]),s=Math.max(...o,1),r=o.length,n=6,i=2,l=r*n+(r-1)*i,d=16,c=a>=60?"var(--rpc-green)":a>=40?"var(--rpc-amber)":"var(--rpc-red)",u="";for(let m=0;m<r;m++){let f=m*(n+i),$=Math.max(2,Math.round(o[m]/s*d)),p=d-$;u+=`<rect x="${f}" y="${p}" width="${n}" height="${$}" fill="${c}" rx="1"/>`}return`<svg width="${l}" height="${d}" viewBox="0 0 ${l} ${d}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:inline-block;vertical-align:middle;flex-shrink:0">${u}</svg>`}function Fe(e=4){let a=De(),t=Ne(e),o=["Mo","Tu","We","Th","Fr","Sa","Su"],s=`<svg width="${a}" height="${t}" viewBox="0 0 ${a} ${t}" xmlns="http://www.w3.org/2000/svg">`;s+="<style>@keyframes rpc-pulse{0%,100%{opacity:.35}50%{opacity:.7}}.rpc-skel{animation:rpc-pulse 1.5s ease-in-out infinite}</style>";for(let r=0;r<7;r++){let n=pe+r*G+q/2;s+=`<text x="${n}" y="13" text-anchor="middle" font-size="9" fill="var(--secondary-text-color,#9ca3af)" font-family="inherit">${o[r]}</text>`}for(let r=0;r<e;r++)for(let n=0;n<7;n++){let i=pe+n*G,l=ye+r*G;s+=`<rect x="${i}" y="${l}" width="${q}" height="${q}" fill="var(--rpc-grey-light, #e5e7eb)" rx="3" class="rpc-skel" style="animation-delay:${(r*7+n)*30}ms"/>`}return s+="</svg>",s}function We(e,a,t,o){if(a.show_alerts===!1)return"";let s=o,r=[],n=e.states[`sensor.${s}_last_error_code`];if(n&&n.state!=="0"&&n.state!==""&&n.state!=="unknown"&&n.state!=="unavailable"){let c=g(n.attributes.label??`Error ${n.state}`),u=g(n.attributes.description??""),m=g(n.attributes.action??""),f=[u,m].filter(Boolean).join(" ")||void 0;r.push({priority:1,text:`Error: ${c}`,subtext:f})}let i=e.states[`binary_sensor.${s}_maintenance_due`];if(i&&i.state==="on"){let c=e.states[`sensor.${s}_readiness`]?.state??"",u="Maintenance due";c==="bin_full"||c==="Bin Full"?u="Bin full \u2014 empty to continue":c&&c!=="Ready"&&c!=="unknown"&&c!=="unavailable"&&(u="Robot not ready \u2014 check the app"),r.push({priority:2,text:u})}if(t.hasWearRate){let c=e.states[`sensor.${s}_filter_wear_rate`],u=e.states[`sensor.${s}_filter_remaining_hours`];if(c&&c.state!=="unknown"&&c.state!=="unavailable"&&u){let $=u.attributes.threshold_hours,p=parseFloat(c.state)/($/90);p>1.5&&r.push({priority:3,text:`Filter wearing ${p.toFixed(1)}\xD7 faster than normal`,subtext:"Check for dust or debris buildup."})}let m=e.states[`sensor.${s}_brush_wear_rate`],f=e.states[`sensor.${s}_brush_remaining_hours`];if(m&&m.state!=="unknown"&&m.state!=="unavailable"&&f){let $=f.attributes.threshold_hours,p=parseFloat(m.state)/($/90);p>1.5&&r.push({priority:4,text:`Brush wearing ${p.toFixed(1)}\xD7 faster than normal`,subtext:"Check for hair tangles."})}}let l=e.states[`sensor.${s}_nav_quality`];if(l&&l.state!=="unknown"&&l.state!=="unavailable"){let c=parseInt(l.state,10);!isNaN(c)&&c<60&&r.push({priority:5,text:`Navigation quality low (${c}/100)`,subtext:"Check lighting or move obstacles in the cleaning area."})}if(t.hasConsecutiveSkips){let c=e.states[`sensor.${s}_consecutive_clean_skips`];if(c&&c.state!=="unknown"&&c.state!=="unavailable"){let u=parseInt(c.state,10);if(!isNaN(u)&&u>0){let m=`Robot blocked from cleaning ${u} consecutive time${u!==1?"s":""}`;r.push({priority:6,text:m,subtext:"Check blocking sensors or robot placement."})}}}if(t.hasWifiFloor){let c=e.states[`sensor.${s}_recent_wifi_floor`];if(c&&c.state!=="unknown"&&c.state!=="unavailable"){let u=parseInt(c.state,10),m=isNaN(u)?NaN:Be(u);!isNaN(m)&&m<50&&r.push({priority:7,text:`Wi-Fi signal dropped to ${m}% during last mission`,subtext:"Consider moving the router or adding a Wi-Fi extender."})}}if(r.length===0)return"";let d=r.sort((c,u)=>c.priority-u.priority)[0];return`
    <div class="rpc-zone rpc-zone5">
      <div class="rpc-alert-box" role="alert">
        <span class="rpc-alert-icon" aria-hidden="true">\u26A0\uFE0F</span>
        <div class="rpc-alert-content">
          <div class="rpc-alert-text">${d.text}</div>
          ${d.subtext?`<div class="rpc-alert-sub">${d.subtext}</div>`:""}
        </div>
      </div>
    </div>
  `}function Ze(e,a){return a?`${Math.round(e*.0929)} m\xB2`:`${e} ft\xB2`}function rt(e){return e==="robot_learned"?"\u{1F6A7}":e==="keepout"?"\u{1F6AB}":"\u{1F4CD}"}function st(e){let a=e.room_name?` \xB7 ${e.room_name}`:"";return e.source==="stuck_events"?`Stuck hotspot${e.stuck_count?` (${e.stuck_count}\xD7)`:""}${a}`:e.source==="robot_learned"?`Robot-detected obstacle${a}`:e.source==="keepout"?`Keep-out zone${a}`:"Hazard"}function je(e,a,t,o,s,r){if(a.show_history===!1)return"";let n=o,i=a.history_days??28,l=a.area_unit??"auto",d=l==="m2"||l==="auto"&&r,{historyTab:c,hazards:u}=s,m=e.states[`vacuum.${n}`]?.attributes??{},f=m.region_icons??{},$=m.last_cleaned_rooms??[],p=m.mission_destination??null,h=new Date().toLocaleDateString("en-CA"),v=s.openDay===h,w=e.states[`sensor.${n}_clean_streak`],y=e.states[`sensor.${n}_completion_rate_30d`],x=w?parseInt(w.state,10):0,k=y?parseInt(y.state,10):NaN,C="",S=[];if(x>0&&S.push(`\u{1F525} ${x}-day streak`),isNaN(k)||S.push(`${k}% completion rate`),t.hasCleaningSpeedTrend){let z=e.states[`sensor.${n}_cleaning_speed_trend`]?.state;z==="declining"?S.push('<span class="rpc-trend-declining">\u2193 Speed declining</span>'):z==="improving"&&S.push('<span class="rpc-trend-improving">\u2191 Speed improving</span>')}S.length&&(C=`<div class="rpc-history-summary">${S.map((A,z)=>z===0?A:`<span class="rpc-summary-sep">\xB7</span>${A}`).join("")}</div>`);let T=t.hasCoverageImage?`
    <div class="rpc-history-tabs">
      <button class="rpc-tab${c==="calendar"?" active":""}" data-history-tab="calendar">Calendar</button>
      <button class="rpc-tab${c==="coverage"?" active":""}" data-history-tab="coverage">Coverage</button>
    </div>`:"",O="";if(t.hasCoverageImage&&c==="coverage"){let z=e.states[`image.${n}_coverage_map`]?.attributes??{},E=z.x_min_mm,R=z.x_max_mm,F=z.y_min_mm,Z=z.y_max_mm,_=z.entity_picture,D=z.last_mission_end,N=E!=null&&R!=null&&F!=null&&Z!=null,Q=N?u.map(P=>{let te=Ie(P.x_mm,P.y_mm,E,R,F,Z),le=g(st(P)),re=rt(P.source);return`<div class="rpc-hazard-pin rpc-pin-${P.source}" style="left:${te.left};top:${te.top}" title="${le}" aria-label="${le}">${re}</div>`}).join(""):"",oe=!N&&_?'<div class="rpc-coverage-note">Spatial overlay unavailable \u2014 grid accumulating</div>':"",ne=D?`<div class="rpc-coverage-updated">Updated ${K(D,e.language)}</div>`:"",ue=u.some(P=>P.source==="stuck_events"),ie=u.some(P=>P.source==="robot_learned"),X=u.some(P=>P.source==="keepout"),ee=[ue?"<span>\u{1F4CD}</span> Stuck hotspot":"",ie?"<span>\u{1F6A7}</span> Robot obstacle":"",X?"<span>\u{1F6AB}</span> Keep-out zone":""].filter(Boolean).join(" ");O=_?`
      <div class="rpc-coverage-panel">
        <div class="rpc-coverage-image-wrap">
          <img class="rpc-coverage-img" src="${_}" alt="Coverage map" />
          ${Q}
        </div>
        ${oe}
        <div class="rpc-coverage-legend">
          <span style="color:var(--rpc-green)">\u25CF</span> High coverage
          <span style="color:var(--rpc-grey-mid,#9ca3af)">\u25CF</span> Rarely cleaned
          ${ee}
        </div>
        ${ne}
      </div>`:'<div class="rpc-history-error">Coverage map unavailable</div>'}let H="";s.loading&&!s.data?H=Fe(Math.ceil(i/7)):s.error?H=`<div class="rpc-history-error">${g(s.error)}</div>`:s.data&&(H=Pe(s.data,i,l,e.language,t.hasDirtDensity),s.data.length<i&&(H+=`<div class="rpc-history-partial">Showing ${s.data.length} of ${i} days \u2014 full history builds over time</div>`));let M="";if(t.hasProblemZone){let A=e.states[`sensor.${n}_problem_zone`],z=e.states[`sensor.${n}_stuck_count_30d`];if(A&&A.state!=="unknown"&&A.state!=="unavailable"){let E=z?parseInt(z.state,10):0;E>0&&(M=`<div class="rpc-problem-zone">\u26A0 ${g(A.state)} \u2014 stuck ${E}\xD7 in 30 days</div>`)}}let Y="";if(s.openDay){let z=new Date(s.openDay+"T00:00:00").toLocaleDateString(e.language,{weekday:"long",month:"long",day:"numeric",year:"numeric"}),E=s.dayMissions,R=s.openDaySummary,F="";if(E===null)F="";else if(R&&R.total===0)F='<div class="rpc-day-empty">No missions this day</div>';else if(E.length>0)F=E.map((_,D)=>{let N=_.result==="completed"?"\u2713":"\u2717",Q=_.result==="completed"?"rpc-day-ok":"rpc-day-err",oe=new Date(_.started_at).toLocaleTimeString(e.language,{hour:"2-digit",minute:"2-digit",hour12:!1}),ne=_.area_sqft!==null?Ze(_.area_sqft,d):"\u2014",ue=_.zones?.map(B=>g(B)).join(" \xB7 ")??"",ie=a.show_dirt_events&&_.dirt_events!=null&&_.dirt_events>0?`${_.dirt_events} dirt event${_.dirt_events!==1?"s":""}`:"",X=[ue,ie].filter(Boolean).join(" \xB7 "),ee=_.initiator==="demand"?'<span class="rpc-initiator-badge">demand</span>':"",P="";if(_.wifi_signal&&_.wifi_signal.length>0){let B=Le(_.wifi_signal),W=Math.min(...B),V=Oe(B,W);P=`<div class="rpc-day-wifi" aria-label="Wi-Fi signal: minimum ${W}% during mission"><span aria-hidden="true">\u{1F4F6}</span>${V}<span>${W}% min</span></div>`}let te="";if(v&&D===E.length-1&&$.length>0){let B=$.map(V=>{let J=f[V],b=J?ce[J]??"":"";return`<span class="rpc-trav-room">${b?b+"\xA0":""}${g(V)}</span>`}).join('<span class="rpc-trav-sep">\u2192</span>'),W=p?`<div class="rpc-mission-dest-popover">\u2192 Final: ${g(p)}</div>`:"";te=`<div class="rpc-traversal-row">${B}</div>${W}`}let re="";_.room_coverage&&Object.keys(_.room_coverage).length>0&&(re=`<div class="rpc-room-coverage">${Object.entries(_.room_coverage).map(([W,V])=>{let J=Math.round(V*100);return`<span class="${J>=80?"rpc-cov-green":J>=60?"rpc-cov-amber":"rpc-cov-red"}">${g(W)} ${J}%</span>`}).join(" \xB7 ")}</div>`);let me="";return _.alignment_confidence!=null&&_.alignment_confidence<.85&&(me=`<div class="rpc-alignment-note">* Coverage estimates (alignment confidence: ${Math.round(_.alignment_confidence*100)}%)</div>`),`
          <div class="rpc-day-mission">
            <span class="rpc-day-icon ${Q}">${N}</span>
            <span class="rpc-day-time">${oe}</span>
            <span class="rpc-day-dur">${_.duration_min} min</span>
            <span class="rpc-day-area">${ne}</span>
            ${ee}
            ${X?`<div class="rpc-day-zones">${X}</div>`:""}
            ${P}
            ${te}
            ${re}
            ${me}
          </div>`}).join("");else if(R&&R.total>0){let _=R.area_sqft!==null?Ze(R.area_sqft,d):null;F=`
        <div class="rpc-day-aggregate">
          <div>${R.total} mission${R.total>1?"s":""} \xB7 ${g(R.result)}
            ${_?` \xB7 ${_} total`:""}</div>
          <div class="rpc-day-no-detail">Per-mission detail not available</div>
        </div>`}let Z=R?.total??0;Y=`
      <div class="rpc-popover rpc-day-popover">
        <div class="rpc-popover-header">
          <span>${g(z)}</span>
          <button class="rpc-popover-close" data-close-day="true" aria-label="Close">\xD7</button>
        </div>
        <div class="rpc-popover-divider"></div>
        ${Z>0&&E&&E.length>0?`<div class="rpc-day-count">${Z} mission${Z>1?"s":""}</div>`:""}
        ${F}
      </div>
    `}let ae="";if(a.show_lifetime!==!1){let A=e.states[`sensor.${n}_lifetime_missions`],z=e.states[`sensor.${n}_recent_area_30d`],E=e.states[`sensor.${n}_recent_time_30d`],R=A?parseInt(A.state,10):NaN,F=E?parseInt(E.state,10):NaN,Z=z?parseFloat(z.state):NaN;if(!isNaN(R)||!isNaN(F)||!isNaN(Z)){let D=s.lifetimeExpanded?`
        <div class="rpc-lifetime-stats">
          <span class="rpc-lifetime-arrow">\u2192</span>
          ${isNaN(R)?"":`<span>${R.toLocaleString()} missions</span>`}
          ${isNaN(Z)?"":`<span>${Z.toLocaleString()} m\xB2</span>`}
          ${isNaN(F)?"":`<span>${F.toLocaleString()} h (30 d)</span>`}
        </div>`:"";ae=`
        <div class="rpc-lifetime-divider"></div>
        <button class="rpc-lifetime-toggle" data-lifetime-toggle aria-expanded="${s.lifetimeExpanded}">
          Stats ${s.lifetimeExpanded?"\u25B2":"\u25BC"}
        </button>
        ${D}
      `}}return`
    <div class="rpc-zone rpc-zone6">
      <div class="rpc-zone-header">LAST ${i} DAYS</div>
      ${C}
      ${T}
      <div class="rpc-heatmap-wrap" data-heatmap>
        ${c==="coverage"&&t.hasCoverageImage?O:H}
      </div>
      ${M}
      ${Y}
      ${ae}
    </div>
  `}function qe(e,a,t,o,s){if((a.entities?.length??0)<2||!o)return"";let r=a.area_unit??"auto",n=r==="m2"||r==="auto"&&s;function i(p){return p==null?"":n?`${Math.round(p*.0929)} m\xB2`:`${Math.round(p)} ft\xB2`}function l(p){return p>=90?"rpc-cov-green":p>=70?"rpc-cov-amber":"rpc-cov-red"}let d=o.robots.map(p=>{let h=Math.round(p.completion_pct),v=i(p.area_sqft),w=[`${p.missions} mission${p.missions!==1?"s":""}`,v].filter(Boolean).join(" \xB7 ");return`
      <div class="rpc-household-robot">
        <span class="rpc-household-name">${g(p.name)}</span>
        <span class="${l(h)}">${h}%</span>
        <span class="rpc-household-meta">${w}</span>
      </div>`}).join(""),c="";o.floors&&o.floors.length>1&&(c=`<div class="rpc-household-floors">${o.floors.map(h=>{let v=i(h.area_sqft),w=[`${h.missions} mission${h.missions!==1?"s":""}`,v].filter(Boolean).join(" \xB7 ");return`
        <div class="rpc-household-floor">
          <span class="rpc-household-floor-label">${g(h.label)}</span>
          <span class="rpc-household-meta">${w}</span>
        </div>`}).join("")}</div>`);let u=o.total,m=Math.round(u.completion_pct),f=i(u.area_sqft),$=[`${u.missions} mission${u.missions!==1?"s":""}`,f].filter(Boolean).join(" \xB7 ");return`
    <div class="rpc-zone rpc-zone7">
      <div class="rpc-zone-header">HOUSEHOLD \u2014 LAST ${o.period_days} DAYS</div>
      ${d}
      ${c}
      <div class="rpc-household-divider"></div>
      <div class="rpc-household-robot rpc-household-combined">
        <span class="rpc-household-name">Combined</span>
        <span class="${l(m)}">${m}%</span>
        <span class="rpc-household-meta">${$}</span>
      </div>
    </div>`}var Ve=`
  :host {
    display: block;
    font-family: inherit;
    /* Semantic colours \u2014 cascade from HA theme when available, fall back to
       accessible defaults that match the standard HA colour palette.
       --state-active-color / --warning-color / --error-color are defined by
       every HA theme including Bubble Card themes and the default theme.      */
    --rpc-green:      var(--state-active-color,   #2d9c4f);
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

  /* \u2500\u2500\u2500 Zone 1 \u2014 Status \u2500\u2500\u2500 */
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
  .rpc-day-ok    { color: var(--rpc-green); }
  .rpc-day-err   { color: var(--rpc-red); }
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
  .rpc-heatmap-wrap { overflow: hidden; }
  /* SVG has explicit width/height attrs \u2014 display:block prevents inline gap */
  .rpc-heatmap-wrap svg { display: block; }
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
`,_e=class extends HTMLElement{constructor(){super();this.robotName="";this.activeRobot="";this.selectedRooms=new Set;this.passes="Auto";this.passSettingInFlight=!1;this.isSendingClean=!1;this.sendError=null;this.settingsPanelOpen=!1;this.loadingAction=null;this.locateTimer=null;this.actionResetTimer=null;this.cleanTimeoutTimer=null;this.openPopover=null;this.resetting=null;this.resetError=null;this.legendShown=!1;this.holdTooltipVisible=!1;this.holdToggling=!1;this.holdTooltipTimer=null;this.alertsVisible=!1;this.lastAlertHtml="";this.alertCollapseTimer=null;this.missionData=null;this.firstRecord=null;this.firstSummary=null;this.historyLoading=!1;this.historyError=null;this.openDay=null;this.dayMissions=null;this.openDaySummary=null;this.lifetimeExpanded=!1;this.hazards=[];this.historyTab="calendar";this.householdData=null;this.apiClient=null;this.prevVacuumState="";this.prevMissionActive="";this.handleOutsideClick=t=>{if(!t.composedPath().includes(this)){let s=!1;this.openPopover!==null&&(this.openPopover=null,s=!0),this.openDay!==null&&(this.openDay=null,this.dayMissions=null,this.openDaySummary=null,s=!0),s&&this.render()}};this.root=this.attachShadow({mode:"open"})}connectedCallback(){document.addEventListener("click",this.handleOutsideClick)}disconnectedCallback(){document.removeEventListener("click",this.handleOutsideClick),[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(t=>{t!==null&&clearTimeout(t)})}setConfig(t){let o=t.entities&&t.entities.length>0?t.entities:[t.entity];if(!o[0])throw new Error("roomba-plus-card: entity is required");let s=this.activeRobot,r=o.includes(s)?s:o[0],n=r!==s;this.config=t,this.activeRobot=r,this.robotName=r.replace("vacuum.",""),n&&this.resetRobotState(),this.root.innerHTML=`<style>${Ve}</style><div class="rpc-card" style="padding:16px;color:var(--secondary-text-color,#9ca3af);font-size:.85rem">Loading\u2026</div>`}set hass(t){let o=this.relevantEntityIds(),s=!this._hass||o.some(d=>t.states[d]?.state!==this._hass.states[d]?.state||t.states[d]?.last_changed!==this._hass.states[d]?.last_changed),r=this._hass;this._hass=t;let n=t.states[`select.${this.robotName}_cleaning_passes`];n&&!this.isSendingClean&&!this.passSettingInFlight&&(this.passes=$e[n.state]??"Auto");let i=`binary_sensor.${this.robotName}_mission_active`,l=t.states[i]?.state??"";if(l)this.prevMissionActive==="on"&&l==="off"&&this.loadHistory(),this.prevMissionActive=l;else{let d=t.states[this.config.entity]?.state??"";this.prevVacuumState==="cleaning"&&d==="docked"&&this.loadHistory(),this.prevVacuumState=d}this.apiClient===null?this.config.show_history!==!1&&(this.apiClient=new de(t,this.config,this.activeRobot),this.loadHistory()):this.apiClient.updateHass(t),(!r||s)&&this.render()}relevantEntityIds(){let t=this.robotName;return[this.activeRobot,`sensor.${t}_last_error_code`,`sensor.${t}_last_error_zone`,`sensor.${t}_phase`,`binary_sensor.${t}_mission_active`,`binary_sensor.${t}_maintenance_due`,`sensor.${t}_readiness`,`binary_sensor.${t}_schedule_hold_active`,`sensor.${t}_next_clean`,`sensor.${t}_filter_remaining_hours`,`sensor.${t}_brush_remaining_hours`,`sensor.${t}_mop_pad`,`sensor.${t}_mop_tank_level`,`sensor.${t}_mop_behavior`,`sensor.${t}_clean_base_status`,`sensor.${t}_nav_quality`,`sensor.${t}_next_likely_clean_window`,`sensor.${t}_presence_clean_opportunities_7d`,`sensor.${t}_presence_clean_utilisation_7d`,`sensor.${t}_cleaning_passes`,`select.${t}_cleaning_passes`,`select.${t}_smart_zone_select`,`select.${t}_zone_select`,`sensor.${t}_clean_streak`,`sensor.${t}_completion_rate_30d`,`sensor.${t}_lifetime_missions`,`sensor.${t}_recent_area_30d`,`sensor.${t}_recent_time_30d`,`sensor.${t}_battery_capacity_retention`,`sensor.${t}_estimated_battery_eol`,`sensor.${t}_recent_wifi_floor`,`sensor.${t}_recent_coverage_pct`,`sensor.${t}_missions_last_30d`,`sensor.${t}_average_mission_time`,`sensor.${t}_cleaning_speed_trend`,`binary_sensor.${t}_consecutive_clean_skips`,`sensor.${t}_area_cleaned_today`,`sensor.${t}_mission_expire_time`,`image.${t}_coverage_map`,...this.config.robot_selector_helper?[this.config.robot_selector_helper]:[]]}entityList(){return this.config.entities&&this.config.entities.length>0?this.config.entities:[this.config.entity]}resetRobotState(){this.apiClient=null,this.missionData=null,this.firstRecord=null,this.firstSummary=null,this.historyLoading=!1,this.historyError=null,this.selectedRooms=new Set,this.passes="Auto",this.passSettingInFlight=!1,this.openPopover=null,this.legendShown=!1,this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.settingsPanelOpen=!1,this.lifetimeExpanded=!1,this.hazards=[],this.historyTab="calendar",this.householdData=null,this.prevVacuumState="",this.prevMissionActive="",this.alertsVisible=!1,this.lastAlertHtml="",[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(t=>{t!==null&&clearTimeout(t)})}async switchRobot(t){if(t===this.activeRobot)return;this.activeRobot=t,this.robotName=t.replace("vacuum.",""),this.resetRobotState(),this.config.show_history!==!1&&this._hass&&(this.apiClient=new de(this._hass,this.config,t),this.loadHistory()),this.render();let o=this.config.robot_selector_helper;if(o&&this._hass.states[o]){let s=o.split(".")[0],r=s==="input_select"?"select_option":"set_value",n=s==="input_select"?{entity_id:o,option:t}:{entity_id:o,value:t};try{await this._hass.callService(s,r,n)}catch(i){console.warn("roomba-plus-card: robot_selector_helper write failed",i)}}}async loadHistory(){if(!this.apiClient||this.historyLoading)return;let t=this.activeRobot;this.historyLoading=!0,this.historyError=null,this.render();try{let o=this.config.history_days??28,s=await this.apiClient.fetchSummary(o),r=await this.apiClient.fetchRecords(o);if(r.length>0){let l=new Map;for(let d of r){let c=d.started_at.slice(0,10);l.has(c)||l.set(c,[]),l.get(c).push(d)}for(let d of s){let c=l.get(d.date);c&&(d.missions=c.sort((u,m)=>u.started_at.localeCompare(m.started_at)))}}let n=await this.apiClient.fetchHazards(),i=(this.config.entities?.length??0)>=2?await this.apiClient.fetchHousehold(o):null;this.missionData=s,this.firstRecord=r.length>0?r[r.length-1]:null,this.firstSummary=s.length>0?s[s.length-1]:null,this.hazards=n,this.householdData=i}catch(o){let s=o.message;this.historyError=s==="404"?"History requires Roomba+ v1.8 or later":"History temporarily unavailable"}finally{if(this.activeRobot!==t)return;this.historyLoading=!1,this.render()}}render(){if(!this.config||!this._hass)return;let t=ge(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),o=this._hass.config?.unit_system?.length==="m",s=new Date,r=`${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,"0")}-${String(s.getDate()).padStart(2,"0")}`,i=(this.missionData?.find(u=>u.date===r)??null)?.total??null,l=We(this._hass,this.config,t,this.robotName),d=l;l?(this.alertCollapseTimer!==null&&(clearTimeout(this.alertCollapseTimer),this.alertCollapseTimer=null),this.alertsVisible=!0,this.lastAlertHtml=l):this.alertsVisible&&(this.alertCollapseTimer===null&&(this.alertCollapseTimer=setTimeout(()=>{this.alertsVisible=!1,this.alertCollapseTimer=null,this.render()},100)),d=this.lastAlertHtml);let c=`
      <style>${Ve}</style>
      <div class="rpc-card">
        ${this.renderRobotSelectorBar()}
        ${Se({hass:this._hass,config:this.config,caps:t,robotName:this.robotName,loadingAction:this.loadingAction,todayMissionCount:i,missionData:this.missionData,settingsPanelOpen:this.settingsPanelOpen})}
        ${we({hass:this._hass,config:this.config,caps:t,robotName:this.robotName,selectedRooms:this.selectedRooms,passes:this.passes,isSending:this.isSendingClean,sendError:this.sendError,settingsPanelOpen:this.settingsPanelOpen})}
        ${Ee(this._hass,this.config,t,this.robotName,{openPopover:this.openPopover,resetting:this.resetting,resetError:this.resetError,legendShown:this.legendShown})}
        ${He(this._hass,this.config,t,this.robotName,{holdTooltipVisible:this.holdTooltipVisible,holdToggling:this.holdToggling})}
        ${d}
        ${je(this._hass,this.config,t,this.robotName,{data:this.missionData,loading:this.historyLoading,error:this.historyError,openDay:this.openDay,dayMissions:this.dayMissions,openDaySummary:this.openDaySummary,lifetimeExpanded:this.lifetimeExpanded,historyTab:this.historyTab,hazards:this.hazards},o)}
        ${qe(this._hass,this.config,t,this.householdData,o)}
      </div>
    `;this.root.innerHTML=c,this.attachEventListeners()}renderRobotSelectorBar(){let t=this.entityList();return t.length<2?"":`<div class="rpc-robot-selector"><select class="rpc-robot-select" data-robot-select>${t.map(s=>{let r=this._hass.states[s]?.attributes?.friendly_name??s,n=s===this.activeRobot?" selected":"";return`<option value="${s}"${n}>${r}</option>`}).join("")}</select></div>`}attachEventListeners(){let t=this.root.querySelector(".rpc-card"),o=t.querySelector("[data-robot-select]");o&&o.addEventListener("change",r=>{r.stopPropagation(),this.switchRobot(r.target.value)}),t.querySelectorAll("[data-action]").forEach(r=>{r.addEventListener("click",n=>{n.stopPropagation(),this.handleAction(r.dataset.action)})}),t.querySelectorAll("[data-room]").forEach(r=>{r.addEventListener("click",n=>{n.stopPropagation();let i=r.dataset.room;this.selectedRooms.has(i)?this.selectedRooms.delete(i):this.selectedRooms.add(i),this.render()})}),t.querySelectorAll("[data-pass]").forEach(r=>{r.addEventListener("click",async n=>{n.stopPropagation();let i=r.dataset.pass,l=r.dataset.passOption;this.passes=i,this.render();let d=`select.${this.robotName}_cleaning_passes`;if(this._hass.states[d]){this.passSettingInFlight=!0;try{await this._hass.callService("select","select_option",{entity_id:d,option:l})}catch{}finally{this.passSettingInFlight=!1}}})}),t.querySelectorAll("[data-bar]").forEach(r=>{let n=i=>{i.stopPropagation();let l=r.dataset.bar;this.openPopover=this.openPopover===l?null:l,this.resetError=null,this.render(),!this.legendShown&&this.root.querySelector("[data-wear-legend]")&&(this.legendShown=!0)};r.addEventListener("click",n),r.addEventListener("keydown",i=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),n(i))})}),t.querySelectorAll("[data-close]").forEach(r=>{r.addEventListener("click",n=>{n.stopPropagation(),this.openPopover=null,this.render()})}),t.querySelectorAll("[data-reset]").forEach(r=>{r.addEventListener("click",async n=>{n.stopPropagation();let i=r.dataset.reset,l=r.dataset.service;this.resetting=i,this.resetError=null,this.render();try{await this._hass.callService("roomba_plus",l,{entity_id:this.config.entity}),await new Promise(d=>setTimeout(d,800)),this.openPopover=null}catch{this.resetError=i}finally{this.resetting=null,this.render()}})}),t.querySelectorAll("[data-hold-action]").forEach(r=>{r.addEventListener("click",async n=>{if(n.stopPropagation(),r.dataset.holdAction==="tooltip")this.holdTooltipVisible=!0,this.render(),this.holdTooltipTimer!==null&&clearTimeout(this.holdTooltipTimer),this.holdTooltipTimer=setTimeout(()=>{this.holdTooltipVisible=!1,this.holdTooltipTimer=null,this.render()},3e3);else{let i=`switch.${this.robotName}_schedule_hold`,l=this._hass.states[i]?.state==="on";this.holdToggling=!0,this.render();try{await this._hass.callService("switch",l?"turn_off":"turn_on",{entity_id:i})}finally{this.holdToggling=!1,this.render()}}})});let s=t.querySelector("[data-heatmap]");s&&s.addEventListener("click",r=>{r.stopPropagation();let n=r.target.closest("[data-date]");if(!n)return;let i=n.getAttribute("data-date");this.openDay===i?(this.openDay=null,this.dayMissions=null,this.openDaySummary=null):(this.openDay=i,this.openDaySummary=this.missionData?.find(l=>l.date===i)??null,this.dayMissions=this.buildDayMissions(i)),this.render()}),t.querySelectorAll("[data-close-day]").forEach(r=>{r.addEventListener("click",n=>{n.stopPropagation(),this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.render()})}),t.querySelectorAll("[data-settings-toggle]").forEach(r=>{r.addEventListener("click",n=>{n.stopPropagation(),this.settingsPanelOpen=!this.settingsPanelOpen,this.render()})}),t.querySelectorAll("[data-switch-entity]").forEach(r=>{r.addEventListener("click",async n=>{n.stopPropagation();let i=r.dataset.switchEntity,l=this._hass.states[i]?.state==="on";try{await this._hass.callService("switch",l?"turn_off":"turn_on",{entity_id:i})}catch{}})}),t.querySelectorAll("[data-cycle-entity]").forEach(r=>{r.addEventListener("click",async n=>{n.stopPropagation();let i=r.dataset.cycleEntity,l=JSON.parse(r.dataset.cycleOptions??"[]"),d=r.dataset.cycleCurrent??"",c=l.indexOf(d),u=l.length>0?l[(c+1)%l.length]:null;if(u)try{await this._hass.callService("select","select_option",{entity_id:i,option:u})}catch{}})}),t.querySelectorAll("[data-lifetime-toggle]").forEach(r=>{r.addEventListener("click",n=>{n.stopPropagation(),this.lifetimeExpanded=!this.lifetimeExpanded,this.render()})}),t.querySelectorAll("[data-history-tab]").forEach(r=>{r.addEventListener("click",n=>{n.stopPropagation(),this.historyTab=r.dataset.historyTab,this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.render()})})}buildDayMissions(t){let o=this.missionData?.find(s=>s.date===t);return!o||o.total===0?[]:o.missions&&o.missions.length>0?o.missions:[]}async handleAction(t){let{entity:o}=this.config,s=this.robotName;if(t==="clean-selected"){this.isSendingClean=!0,this.sendError=null,this.render();let d=Array.from(this.selectedRooms);this.cleanTimeoutTimer=setTimeout(()=>{this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app",this.cleanTimeoutTimer=null,this.render()},8e3);try{let c=`select.${s}_cleaning_passes`;this.passes!=="Auto"&&this._hass.states[c]&&await this._hass.callService("select","select_option",{entity_id:c,option:fe[this.passes]??this.passes}),await this._hass.callService("roomba_plus","clean_room",{entity_id:o,room_name:d,ordered:!1}),clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null,this.selectedRooms.clear(),this.isSendingClean=!1}catch{this.cleanTimeoutTimer!==null&&(clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null),this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app"}this.render();return}if(t==="repeat-last"){try{await this._hass.callService("button","press",{entity_id:`button.${s}_repeat_mission`})}catch{}return}let n={start:["vacuum","start"],pause:["vacuum","pause"],resume:["vacuum","start"],return_home:["vacuum","return_to_base"],locate:["vacuum","locate"]}[t];if(!n)return;let[i,l]=n;if(this.loadingAction=t,this.render(),t==="locate"){this.locateTimer=setTimeout(()=>{this.loadingAction=null,this.locateTimer=null,this.render()},2e3);try{await this._hass.callService(i,l,{entity_id:o})}catch{}return}this.actionResetTimer=setTimeout(()=>{this.loadingAction=null,this.actionResetTimer=null,this.render()},5e3);try{await this._hass.callService(i,l,{entity_id:o})}finally{this.actionResetTimer!==null&&(clearTimeout(this.actionResetTimer),this.actionResetTimer=null),this.loadingAction=null,this.render()}}getCardSize(){if(!this.config||!this._hass)return 10;let t=ge(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),o=4;return t.hasZones&&this.config.show_rooms!==!1&&(o+=3),this.config.show_health!==!1&&(o+=2),this.config.show_schedule!==!1&&(o+=2),this.config.show_history!==!1&&(o+=4),o}static getConfigForm(){return{schema:[{name:"entity",label:"Robot vacuum",required:!0,selector:{entity:{domain:"vacuum"}}},{name:"entities",label:"Multiple robots (overrides single robot above)",selector:{entity:{domain:"vacuum",multiple:!0}}},{name:"area_unit",label:"Area unit",selector:{select:{options:["auto","sqft","m2"],mode:"dropdown"}}},{name:"history_days",label:"History window",selector:{select:{options:[{value:7,label:"7 days"},{value:14,label:"14 days"},{value:28,label:"28 days"}],mode:"dropdown"}}},{name:"presence_entities",label:"Presence sensors (person.* entities)",selector:{entity:{domain:"person",multiple:!0}}},{name:"show_rooms",label:"Show room selector zone",selector:{boolean:{}}},{name:"show_settings",label:"Show settings panel",selector:{boolean:{}}},{name:"show_health",label:"Show health zone",selector:{boolean:{}}},{name:"show_schedule",label:"Show schedule & presence zone",selector:{boolean:{}}},{name:"show_alerts",label:"Show alerts zone",selector:{boolean:{}}},{name:"show_history",label:"Show history zone",selector:{boolean:{}}},{name:"show_lifetime",label:"Show lifetime stats",selector:{boolean:{}}},{name:"show_dirt_events",label:"Show dirt events in day detail",selector:{boolean:{}}},{name:"robot_selector_helper",label:"Robot selector helper (input_text or input_select \u2014 for xiaomi card sync)",selector:{entity:{domain:["input_text","input_select"]}}}]}}static getStubConfig(){return{entity:"vacuum.roomba"}}};typeof customElements<"u"&&customElements.define("roomba-plus-card",_e);typeof window<"u"&&(window.customCards??(window.customCards=[]),window.customCards.push({type:"roomba-plus-card",name:"Roomba+ Card",description:"Full-featured card for the roomba_plus integration",preview:!0,documentationURL:"https://github.com/johnnyh1975/ha_roomba_plus_card"}));
