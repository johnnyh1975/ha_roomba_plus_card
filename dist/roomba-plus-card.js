function oe(e,n,t,o,s){let r=d=>!!e.states[`sensor.${n}_${d}`],a=d=>!!e.states[`select.${n}_${d}`],i=d=>!!e.states[`binary_sensor.${n}_${d}`],c=d=>!!e.states[`image.${n}_${d}`],l=r("mop_pad"),p=r("brush_remaining_hours");return{hasArea:r("area_cleaned_today"),hasBrush:p,hasPad:l,hasWater:r("mop_tank_level"),hasCleanBase:r("clean_base_status"),hasZones:a("smart_zone_select")||a("zone_select"),hasSmartZones:a("smart_zone_select"),hasProblemZone:r("problem_zone"),hasLifetimeArea:r("recent_area_30d"),hasWearRate:r("filter_wear_rate"),isMop:l&&!p,hasMissionActive:i("mission_active"),hasMissionPhase:r("phase"),hasCleaningSpeedTrend:r("cleaning_speed_trend"),hasBatteryRetention:r("battery_capacity_retention"),hasWifiFloor:r("recent_wifi_floor"),hasCoveragePct:r("recent_coverage_pct"),hasBatteryEol:r("estimated_battery_eol"),hasConsecutiveSkips:r("consecutive_clean_skips"),hasMopBehavior:r("mop_behavior"),hasCoverageImage:c("coverage_map"),hasWifiSignal:o?.wifi_signal!=null,hasRoomCoverage:o!=null&&"room_coverage"in o,hasDirtDensity:s!=null&&"dirt_density"in s,hasRobotSelectorHelper:!!t.robot_selector_helper&&!!e.states[t.robot_selector_helper]}}var ne=class{constructor(n,t,o){this.hass=n;this.entryId=null;this.entityId=o??t.entity}updateHass(n){this.hass=n}async fetchSummary(n){let o=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=summary&days=${n}`,s=await this.hass.fetchWithAuth(o);if(!s.ok)throw new Error(`${s.status}`);return s.json()}async fetchRecords(n){let o=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=records&days=${n}`,s=await this.hass.fetchWithAuth(o);return s.ok?s.json():[]}async resolveEntryId(){if(this.entryId)return this.entryId;let n=await this.hass.callWS({type:"config/entity_registry/get",entity_id:this.entityId});return this.entryId=n.config_entry_id,this.entryId}async fetchHazards(){let t=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=hazards`,o=await this.hass.fetchWithAuth(t);return o.ok?o.json():[]}};function f(e){return String(e??"").replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n]??n)}function K(e,n="en"){let t=Date.now()-new Date(e).getTime(),o=Math.floor(t/6e4);try{let s=new Intl.RelativeTimeFormat(n,{numeric:"auto"});if(o<1)return s.format(0,"minute");if(o<60)return s.format(-o,"minute");let r=Math.floor(o/60);if(r<24)return s.format(-r,"hour");let a=Math.floor(r/24);return a<30?s.format(-a,"day"):s.format(-Math.floor(a/30),"month")}catch{if(o<1)return"just now";if(o<60)return`${o}m ago`;let s=Math.floor(o/60);return s<24?`${s}h ago`:`${Math.floor(s/24)}d ago`}}var he={sofa:"\u{1F6CB}\uFE0F",bed:"\u{1F6CF}\uFE0F","bed-double":"\u{1F6CF}\uFE0F","silverware-fork-knife":"\u{1F37D}\uFE0F",stove:"\u{1F373}",microwave:"\u{1F4E6}",fridge:"\u{1F9CA}",toilet:"\u{1F6BD}",shower:"\u{1F6BF}",bathtub:"\u{1F6C1}",desk:"\u{1F5A5}\uFE0F","chair-rolling":"\u{1F4BA}",television:"\u{1F4FA}",bookshelf:"\u{1F4DA}",wardrobe:"\u{1F454}",home:"\u{1F3E0}",garage:"\u{1F697}",door:"\u{1F6AA}",stairs:"\u{1FA9C}",balcony:"\u{1F305}",pool:"\u{1F3CA}","washing-machine":"\u{1FAE7}",hanger:"\u{1F9F9}","baby-carriage":"\u{1F37C}",dog:"\u{1F415}",cat:"\u{1F408}","floor-plan":"\u{1F4D0}","map-marker":"\u{1F4CD}",star:"\u2B50",heart:"\u2764\uFE0F","office-building":"\u{1F3E2}",school:"\u{1F3EB}"},ge="\u{1F4CD}";var ie={Auto:"Auto","\xD71":"One pass","\xD72":"Two passes"},fe={Auto:"Auto","One pass":"\xD71","Two passes":"\xD72"};function ce(e,n,t,o,s=!1){if(n.show_settings===!1)return"";let r=t,a=e.states[`switch.${r}_edge_clean`],i=e.states[`switch.${r}_always_finish`],c=e.states[`select.${r}_carpet_boost_mode`];if(!a&&!i&&!c)return"";let l="";if(o){let h=a?.state==="on",g=i?.state==="on",u=c?c.attributes.options??[]:[];l=`
      <div class="rpc-settings-panel">
        ${a?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Edge clean</span>
            <button class="rpc-setting-toggle${h?" rpc-setting-on":""}"
                    data-switch-entity="switch.${r}_edge_clean"
                    aria-pressed="${h}">
              ${h?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${i?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Always finish</span>
            <button class="rpc-setting-toggle${g?" rpc-setting-on":""}"
                    data-switch-entity="switch.${r}_always_finish"
                    aria-pressed="${g}">
              ${g?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${c?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Carpet boost</span>
            <button class="rpc-setting-cycle"
                    data-cycle-entity="select.${r}_carpet_boost_mode"
                    data-cycle-options="${f(JSON.stringify(u))}"
                    data-cycle-current="${f(c.state)}">
              ${f(c.state)} \u25BC
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
    ${l}
  `}function ve(e){let{hass:n,config:t,caps:o,robotName:s,selectedRooms:r,passes:a,isSending:i,sendError:c,settingsPanelOpen:l}=e;if(!o.hasZones||t.show_rooms===!1)return"";let p=s,d=n.states[`select.${p}_smart_zone_select`],h=n.states[`select.${p}_zone_select`],g=d??h;if(!g)return"";let u=g.attributes.options??[];if(u.length===0)return"";let m=n.states[`button.${p}_repeat_mission`],b=!!m&&m.state!=="unavailable",$=n.states[`select.${p}_cleaning_passes`],k=o.isMop?"\u25B6 Mop selected rooms":"\u25B6 Clean selected rooms",y=r.size,w='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',R=(()=>{let T=o.hasSmartZones?`select.${s}_smart_zone_select`:`select.${s}_zone_select`,_=n.states[T]?.attributes?.region_icons;return _&&typeof _=="object"&&!Array.isArray(_)?_:{}})(),z=u.map(T=>{let _=r.has(T),H=R[T],D=H?he[H]??ge:"",v=D?`${D} ${f(T)}`:f(T);return`<button class="rpc-room-chip${_?" rpc-room-chip--selected":""}"
      data-room="${f(T)}" aria-pressed="${_}">${v}</button>`}).join(""),S="";if($){let T=a;S=`
      <div class="rpc-passes-row">
        <span class="rpc-passes-label">Passes:</span>
        ${["Auto","\xD71","\xD72"].map(_=>`<button class="rpc-pass-chip${T===_?" rpc-pass-chip--selected":""}"
            data-pass="${_}"
            data-pass-option="${f(ie[_]??_)}">${_}</button>`).join("")}
      </div>
    `}let E=ce(n,t,s,l);return`
    <div class="rpc-zone rpc-zone2">
      <div class="rpc-zone-header">ROOMS</div>
      <div class="rpc-chips-row">
        ${z}
        ${y>0?`<span class="rpc-selected-count">${y} selected</span>`:""}
      </div>
      ${S}
      <div class="rpc-room-actions">
        <button class="rpc-btn rpc-btn-primary${y===0||i?" rpc-btn-disabled":""}"
                data-action="clean-selected"
                ${y===0||i?"disabled":""}
                aria-label="${k}">
          ${i?w+" Sending\u2026":k}
        </button>
        ${b?'<button class="rpc-btn-text" data-action="repeat-last">\u21A9 Repeat last</button>':""}
      </div>
      ${c?`<div class="rpc-send-error">${f(c)}</div>`:""}
      ${E}
    </div>
  `}function X(e,n){return e.states[n]?.state??"unavailable"}function be(e,n,t){return n==="m2"||n==="auto"&&t?`${Math.round(e*.0929)} m\xB2`:`${e} ft\xB2`}function We(e,n){if(!e)return null;for(let t=e.length-1;t>=0;t--){let o=e[t];if(o.missions&&o.missions.length>0)for(let s=o.missions.length-1;s>=0;s--){let r=o.missions[s];if(r.result==="completed")return K(r.started_at,n)}else if(o.completed>0)return K(o.date+"T12:00:00Z",n)}return null}function Ze(e){let n=["th","st","nd","rd"],t=e%100;return e+(n[(t-20)%10]??n[t]??n[0])}function ye(e){let{hass:n,config:t,caps:o,robotName:s,loadingAction:r,todayMissionCount:a,settingsPanelOpen:i}=e,c=t.entity,l=X(n,c),p=n.states[c]?.attributes??{},d=n.config?.unit_system?.length==="m",h=t.area_unit??"auto",g=l==="unavailable",u=r!==null,m=s,b=`sensor.${m}_last_error_code`,$=`sensor.${m}_last_error_zone`,C=`sensor.${m}_mission_recharge_time`,k=`sensor.${m}_average_mission_time`,y=`sensor.${m}_area_cleaned_today`,w=p.mission_elapsed_min??null,R=p.mission_area_sqft??null,z=parseFloat(X(n,k)),S=isNaN(z)||z<=0?45:z,E=o.isMop,T=E?"\u{1F9F9}":"\u{1F916}",_=f(p.friendly_name??c),H=n.states[`sensor.${m}_phase`]?.state??"",v=(n.states[`binary_sensor.${m}_mission_active`]?.state??"")==="on",j=o.hasMissionActive,O=n.states[`sensor.${m}_mission_expire_time`]?.state??"",q=O&&O!=="unavailable"&&O!=="unknown"?new Date(O):null,ee=!!q&&!isNaN(q.getTime())&&q>new Date,te=ee?Math.max(1,Math.round((q.getTime()-Date.now())/6e4)):null,F=!1;if(j)F=l==="docked"&&v;else{let x=X(n,C);F=l==="docked"&&(x!=="unavailable"&&x!=="unknown"&&O!=="unavailable"&&O!=="unknown")&&ee}let N="",A="",V="";if(H==="evac")N="\u2B06",A="Emptying bin";else if(F)N="\u26A1",A=te!==null?`Recharging \u2014 resuming in ~${te} min`:"Recharging \u2014 mission continues";else switch(l){case"cleaning":N="\u25CF",A=E?"Mopping":"Cleaning";break;case"paused":N="\u23F8",A="Paused";break;case"returning":N="\u21A9",A="Returning to dock";break;case"docked":N="\u2713",A="Docked";break;case"idle":N="\u25CB",A="Idle";break;case"error":N="\u26A0",A="Error",V="rpc-error-state";break;case"unavailable":N="\u2014",A="Unavailable";break}let M="";if(l==="error"){let x=n.states[b];if(x&&x.state!=="0"&&x.state!==""&&x.state!=="unavailable"){let P=f(x.attributes.description??"Unknown error"),I=f(x.attributes.action??""),L=X(n,$),se=L&&L!=="unknown"&&L!=="unavailable";A=`Error ${f(x.state)} \u2014 ${P}`,M=`
        ${I?`<div class="rpc-error-action">${I}</div>`:""}
        ${se?`<div class="rpc-error-zone">Zone: ${f(L)}</div>`:""}
      `}else A="Robot error \u2014 check the iRobot app"}let U="";if((j?v:l==="cleaning"||F)&&o.hasArea){let x=parseFloat(X(n,y));if(!isNaN(x)&&x>0){let P=be(x,h,d),I=a!==null?a+1:null,L=I!==null&&I>1?` \xB7 ${f(Ze(I))} mission`:"";U=`<div class="rpc-area-today">${P} already today${L}</div>`}}let Z="";l==="cleaning"&&w!==null&&(Z=`<div class="rpc-progress-track"><div class="rpc-progress-fill" style="width:${Math.min(w/S*100,95)}%"></div></div>`);let re="";if(l==="cleaning"){let x=[];if(w!==null){let P=Math.max(0,Math.round(S-w));x.push(`<div class="rpc-metric"><span class="rpc-metric-val">~${P} min</span><span class="rpc-metric-lbl">Remaining</span></div>`)}if(o.hasArea&&R!==null){x.push(`<div class="rpc-metric"><span class="rpc-metric-val">${be(R,h,d)}</span><span class="rpc-metric-lbl">Cleaned</span></div>`);let P=parseFloat(X(n,`sensor.${m}_recent_area_30d`)),I=parseFloat(X(n,`sensor.${m}_missions_last_30d`)),L=!isNaN(P)&&!isNaN(I)&&I>=5?P/I:NaN;if(!isNaN(L)&&L>0){let se=Math.round((R-L)/L*100),Oe=se>=0?"\u25B2":"\u25BC",Fe=se>=0?"rpc-delta-up":"rpc-delta-down";x.push(`<div class="rpc-metric"><span class="rpc-metric-val ${Fe}">${Oe} ${Math.abs(se)}%</span><span class="rpc-metric-lbl">vs usual</span></div>`)}}x.length&&(re=`<div class="rpc-metrics-row">${x.join("")}</div>`)}let J="";if(l==="docked"&&!F){let x=We(e.missionData,n.language);if(x)J=`<div class="rpc-docked-since">Last cleaned: ${x}</div>`;else{let P=n.states[c]?.last_changed;P&&(J=`<div class="rpc-docked-since">Last mission: ${K(P,n.language)}</div>`)}}let ue='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',G=(x,P,I)=>{let L=r===x;return`<button class="rpc-btn${L?" rpc-btn-loading":""}"
      data-action="${x}"
      ${g||u?"disabled":""}
      aria-label="${P}">
      ${L?ue:I}
    </button>`},Q="";l==="cleaning"||H==="evac"?Q=G("pause","Pause","\u23F8 Pause")+G("return_home","Return home","\u21A9 Return home"):l==="paused"?Q=G("resume","Resume","\u25B6 Resume")+G("return_home","Return home","\u21A9 Return home"):F?Q=G("return_home","Cancel mission","\u2715 Cancel mission"):l!=="returning"&&!g&&(Q=G("start","Start","\u25B6 Start")+G("locate","Locate","\u2299 Locate"));let me=t.show_rooms!==!1;if(!me){let x=n.states[`button.${s}_repeat_mission`];!!x&&x.state!=="unavailable"&&(Q+='<button class="rpc-btn-text" data-action="repeat-last">\u21A9 Repeat last</button>')}let Be=me?"":ce(n,t,s,i,!0);return`
    <div class="rpc-zone rpc-zone1${V?" "+V:""}">
      <div class="rpc-robot-identity">
        <span class="rpc-robot-icon">${T}</span>
        <span class="rpc-robot-name">${_}</span>
      </div>
      <div class="rpc-state-row">
        <span class="rpc-state-dot rpc-state-${l}">${N}</span>
        <span class="rpc-state-label">${A}</span>
      </div>
      ${U}
      ${M}
      ${Z}
      ${re}
      ${J}
      ${Q?`<div class="rpc-actions">${Q}</div>`:""}
      ${Be}
    </div>
  `}function _e(e,n){return Math.min(100,Math.max(0,Math.round(e/n*100)))}function xe(e,n){return n==="battery"?e>20?"var(--rpc-green)":e>10?"var(--rpc-amber)":"var(--rpc-red)":n==="tank"?e>40?"var(--rpc-green)":e>20?"var(--rpc-amber)":"var(--rpc-red)":e>50?"var(--rpc-green)":e>10?"var(--rpc-amber)":"var(--rpc-red)"}function je(e,n){let t=n/90;if(!t)return"";let o=e/t;return o>1.2?"\u2191":o<.8?"\u2193":"\u2192"}function $e(e){let n=parseInt(e,10);return!isNaN(n)&&n>=0?`~${n} use${n!==1?"s":""} remaining`:e==="Empty"?"Bag full \u2014 replace soon":e==="Full"?"Bag has capacity":f(e)}function we(e,n,t,o,s){if(n.show_health===!1)return"";let r=o,a=[];e.states[`sensor.${r}_filter_remaining_hours`]&&a.push({key:"filter",label:"Filter",sensorId:`sensor.${r}_filter_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:t.hasWearRate?`sensor.${r}_filter_wear_rate`:void 0,resetService:"reset_filter",lastReplacedId:`sensor.${r}_filter_last_replaced`}),t.hasBrush&&e.states[`sensor.${r}_brush_remaining_hours`]&&a.push({key:"brush",label:"Brush",sensorId:`sensor.${r}_brush_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:t.hasWearRate?`sensor.${r}_brush_wear_rate`:void 0,resetService:"reset_brush",lastReplacedId:`sensor.${r}_brush_last_replaced`}),t.hasPad&&e.states[`sensor.${r}_pad_days_until_due`]&&a.push({key:"pad",label:"Pad",sensorId:`sensor.${r}_pad_days_until_due`,thresholdAttr:"threshold_days",type:"consumable",unit:"d",wearSensorId:t.hasWearRate?`sensor.${r}_pad_wear_rate`:void 0,resetService:"reset_pad",lastReplacedId:`sensor.${r}_pad_last_replaced`}),t.hasWater&&e.states[`sensor.${r}_mop_tank_level`]&&a.push({key:"tank",label:"Tank",sensorId:`sensor.${r}_mop_tank_level`,thresholdAttr:null,type:"tank"});let i=e.states[`sensor.${r}_battery`]?`sensor.${r}_battery`:null,c=i?void 0:e.states[`vacuum.${r}`]?.attributes?.battery_level;if((i||c!==void 0)&&a.push({key:"battery",label:"Battery",sensorId:i??"",thresholdAttr:null,type:"battery",rawPct:c}),t.hasCleanBase&&e.states[`sensor.${r}_clean_base_status`]&&a.push({key:"cleanbase",label:"Clean Base",sensorId:`sensor.${r}_clean_base_status`,thresholdAttr:null,type:"cleanbase"}),a.length===0)return"";let l=a.map(u=>qe(u,e,r,s)).join(""),p="";if(t.hasBatteryRetention){let u=e.states[`sensor.${r}_battery_capacity_retention`];if(u&&u.state!=="unavailable"&&u.state!=="unknown"){let m=Math.round(parseFloat(u.state));if(!isNaN(m)){let b=m>85?"var(--rpc-green)":m>70?"var(--rpc-amber)":"var(--rpc-red)",$=e.states[`sensor.${r}_battery_cycles`],C=$?parseInt($.state,10):NaN,k=isNaN(C)?"":`${C} charge cycle${C!==1?"s":""}`,y="";if(t.hasBatteryEol){let z=e.states[`sensor.${r}_estimated_battery_eol`];if(z&&z.state!=="unavailable"&&z.state!=="unknown"){let S=parseInt(z.state,10);isNaN(S)||(y=S>0?`<div class="rpc-retention-eol">Battery life: ~${S} days remaining</div>`:'<div class="rpc-retention-eol rpc-retention-eol--warn">Consider replacing \u2014 battery at end of life</div>')}}let w=s.openPopover==="retention",R=w?`
          <div class="rpc-popover">
            <div class="rpc-popover-header">
              <span>Battery Health</span>
              <button class="rpc-popover-close" data-close="retention" aria-label="Close">\xD7</button>
            </div>
            <div class="rpc-popover-divider"></div>
            <div class="rpc-popover-body">
              <div>${m}% of original capacity</div>
              ${k?`<div class="rpc-popover-sub">${k}</div>`:""}
              ${y}
            </div>
          </div>`:"";p=`
          <div class="rpc-bar-row" data-bar="retention" role="button" aria-expanded="${w}" tabindex="0"
               aria-label="Bat. Health \u2014 ${m}%">
            <span class="rpc-bar-label">Bat. Health</span>
            <span class="rpc-bar-track"><span class="rpc-bar-fill" style="width:${m}%;background:${b}"></span></span>
            <span class="rpc-bar-pct" style="color:${b}">${m}%</span>
          </div>
          ${R}`}}}let d="";if(t.hasCoveragePct){let u=e.states[`sensor.${r}_recent_coverage_pct`];if(u&&u.state!=="unavailable"&&u.state!=="unknown"){let m=e.states[`sensor.${r}_missions_last_30d`],b=m?parseInt(m.state,10):NaN;if(isNaN(b)||b<10)d=`
          <div class="rpc-bar-row rpc-bar-row--static">
            <span class="rpc-bar-label">Coverage</span>
            <span class="rpc-coverage-building">Building history\u2026</span>
          </div>`;else{let $=Math.min(100,Math.round(parseFloat(u.state)));if(!isNaN($)){let C=$>=85?"var(--rpc-green)":$>=65?"var(--rpc-amber)":"var(--rpc-red)",k=s.openPopover==="coverage",y=isNaN(b)?"":`Based on ${b} mission${b!==1?"s":""} in the last 30 days.`,w=k?`
            <div class="rpc-popover">
              <div class="rpc-popover-header">
                <span>Floor Coverage</span>
                <button class="rpc-popover-close" data-close="coverage" aria-label="Close">\xD7</button>
              </div>
              <div class="rpc-popover-divider"></div>
              <div class="rpc-popover-body">
                <div>${$}% of floor area covered on the last mission.</div>
                ${y?`<div class="rpc-popover-sub">${y}</div>`:""}
                <div class="rpc-popover-sub">Low coverage may indicate obstacles, map drift, or a missed room.</div>
              </div>
            </div>`:"";d=`
            <div class="rpc-bar-row" data-bar="coverage" role="button" aria-expanded="${k}" tabindex="0"
                 aria-label="Coverage ${$}% last mission">
              <span class="rpc-bar-label">Coverage</span>
              <span class="rpc-bar-track"><span class="rpc-bar-fill" style="width:${$}%;background:${C}"></span></span>
              <span class="rpc-bar-pct" style="color:${C}">${$}%</span>
              <span class="rpc-bar-hours">last mission</span>
            </div>
            ${w}`}}}}let h=p||d?`<div class="rpc-health-battery-sep"></div>${p}${d}`:"",g="";if(t.isMop){let u=e.states[`sensor.${r}_mop_pad`],m=t.hasMopBehavior?e.states[`sensor.${r}_mop_behavior`]:null,b=[];u&&u.state!=="unknown"&&u.state!=="unavailable"&&b.push(f(u.state)),m&&m.state!=="unknown"&&m.state!=="unavailable"&&b.push(`${f(m.state)} intensity`),b.length&&(g=`
        <div class="rpc-health-divider"></div>
        <div class="rpc-mop-config">${b.join(" \xB7 ")}</div>
      `)}return`
    <div class="rpc-zone rpc-zone3">
      <div class="rpc-zone-header">HEALTH</div>
      ${l}
      ${h}
      ${g}
    </div>
  `}function qe(e,n,t,o){let s=o.openPopover===e.key;if(e.type==="cleanbase"){let h=n.states[e.sensorId];return h?`
      <div class="rpc-bar-row" data-bar="${e.key}" role="button" aria-expanded="${s}" tabindex="0"
           aria-label="${e.label}">
        <span class="rpc-bar-label">${e.label}</span>
        <span class="rpc-bar-cleanbase-state">${$e(h.state)}</span>
      </div>
      ${s?Ue(e.label,h.state):""}
    `:""}let r=0,a="",i="",c=null;if(e.rawPct!==void 0)r=Math.min(100,Math.max(0,e.rawPct)),a=`${Math.round(r)}%`;else{let h=n.states[e.sensorId];if(!h)return"";let g=parseFloat(h.state);if(isNaN(g))return"";if(e.type==="tank"||e.type==="battery")r=Math.min(100,Math.max(0,g)),a=`${Math.round(r)}%`;else{if(c=e.thresholdAttr?h.attributes[e.thresholdAttr]:null,!c)return"";r=_e(g,c),a=`${r}%`,i=`${Math.round(g)}h`}}let l=xe(r,e.type),p="";if(e.wearSensorId&&c){let h=n.states[e.wearSensorId];h&&h.state!=="unknown"&&h.state!=="unavailable"&&(p=je(parseFloat(h.state),c))}let d=e.rawPct!==void 0?{state:String(Math.round(e.rawPct)),attributes:{}}:n.states[e.sensorId];return`
    <div class="rpc-bar-row" data-bar="${e.key}" role="button" aria-expanded="${s}" tabindex="0"
         aria-label="${e.label} \u2014 ${a}">
      <span class="rpc-bar-label">${e.label}</span>
      <div class="rpc-bar-track">
        <div class="rpc-bar-fill" style="width:${r}%;background:${l}"></div>
      </div>
      <span class="rpc-bar-pct" style="color:${l}">${a}</span>
      ${i?`<span class="rpc-bar-hours">${i}</span>`:""}
      ${p?`<span class="rpc-bar-arrow" style="color:${l}">${p}</span>`:""}
    </div>
    ${s&&d?Ve(e,d,c,n,o):""}
  `}function Ve(e,n,t,o,s){let r=parseFloat(n.state),a=t?_e(r,t):Math.min(100,Math.max(0,r)),i=xe(a,e.type),c=s.resetting===e.key,l=e.lastReplacedId?o.states[e.lastReplacedId]:null,p="";l&&l.state!=="unavailable"&&l.state!=="unknown"&&(p=`
      <div class="rpc-popover-row">
        <span>Last replaced</span>
        <span>${new Date(l.state).toLocaleDateString(o.language)} (${K(l.state,o.language)})</span>
      </div>`);let d="";if(e.wearSensorId&&!s.legendShown){let g=o.states[e.wearSensorId];g&&g.state!=="unknown"&&g.state!=="unavailable"&&(d=`
        <div class="rpc-wear-legend" data-wear-legend>
          <span class="rpc-wear-legend-title">Wear trend</span>
          <span>\u2191 wearing faster than normal</span>
          <span>\u2192 wearing at normal rate</span>
          <span>\u2193 wearing slower than normal</span>
        </div>`)}return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${f(e.label)}</span>
        <button class="rpc-popover-close" data-close="${e.key}" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      ${p}
      ${t?`<div class="rpc-popover-row"><span>Threshold</span><span>${t} ${e.unit??"h"}</span></div>`:""}
      ${t?`<div class="rpc-popover-row"><span>Remaining</span><span>${Math.round(r)} ${e.unit??"h"} (${a}%)</span></div>`:""}
      <div class="rpc-popover-bar-track">
        <div class="rpc-popover-bar-fill" style="width:${a}%;background:${i}"></div>
      </div>
      ${d}
      ${e.resetService?`
        <button class="rpc-btn rpc-btn-secondary${c?" rpc-btn-loading":""}"
                data-reset="${e.key}" data-service="${e.resetService}"
                ${c?"disabled":""}>
          ${c?'<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':"Mark as replaced"}
        </button>
        ${s.resetError===e.key?'<div class="rpc-send-error">Reset failed \u2014 try again</div>':""}
      `:""}
    </div>
  `}function Ue(e,n){return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${f(e)}</span>
        <button class="rpc-popover-close" data-close="cleanbase" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      <div class="rpc-popover-row"><span>Status</span><span>${$e(n)}</span></div>
      <div class="rpc-popover-row"><span>Function</span><span>Auto-empties bin after missions</span></div>
    </div>
  `}function Ke(e,n){if(!e||e==="unavailable"||e==="unknown")return"No schedule set";try{let t=new Date(e);return t.toLocaleDateString(n,{weekday:"short"})+" "+t.toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return f(e)}}function Ye(e,n){if(!e||e==="unavailable"||e==="unknown")return"";try{let t=new Date(e);if(isNaN(t.getTime()))return"";let o=t.toLocaleDateString(n,{weekday:"short"}),s=t.toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit",hour12:!1});return`${o} ~${s}`}catch{return""}}function ke(e,n,t,o,s){if(n.show_schedule===!1)return"";let r=o,a=e.states[`sensor.${r}_next_clean`],i=e.states[`binary_sensor.${r}_schedule_hold_active`],c=e.states[`sensor.${r}_presence_clean_opportunities_7d`],l=e.states[`sensor.${r}_presence_clean_utilisation_7d`],p=e.states[`sensor.${r}_next_likely_clean_window`],d=!!c&&!!l&&c.state!=="unknown"&&c.state!=="unavailable"&&l.state!=="unknown"&&l.state!=="unavailable",h=!!p&&p.state!=="unknown"&&p.state!=="unavailable";if(!a&&!i&&!d&&!h)return"";let g="";if(i){let C=i.state==="on",y=i.attributes.source==="presence_manager",w="rpc-badge-green",R="Schedule active",z="";C&&(y?(w="rpc-badge-blue",R="Away hold",z="\u{1F3C3}"):(w="rpc-badge-amber",R="Hold active",z="\u{1F512}")),g=`
      <button class="rpc-hold-badge ${w}"
              data-hold-action="${y?"tooltip":"toggle"}"
              aria-label="${f(R)}">
        ${s.holdToggling?'<svg class="rpc-spinner rpc-spinner-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':`${z} ${R}`}
      </button>
      ${s.holdTooltipVisible?`
        <div class="rpc-hold-tooltip" role="status">
          Schedule managed by presence automation \u2014 controlled automatically
        </div>`:""}
    `}let u="";if(h){let C=Ye(p.state,e.language);C&&(u=`
        <div class="rpc-next-clean rpc-next-clean--likely">
          <span class="rpc-schedule-label">Next likely window</span>
          <span class="rpc-schedule-time rpc-schedule-time--approx">${C}</span>
        </div>
      `)}let m="",b=n.presence_entities??[];if(b.length>0){let C=b.map(k=>{let y=e.states[k];if(!y)return"";let w=y.state==="home",R=y.attributes.friendly_name??k,z=f(R.split(" ")[0]);return`<span class="rpc-presence-dot">
        <span class="rpc-dot ${w?"rpc-dot-amber":"rpc-dot-green"}" aria-hidden="true"></span>
        ${z}
        <span class="rpc-presence-label">${w?"home":"away"}</span>
      </span>`}).join("");C&&(m=`<div class="rpc-presence-row">${C}</div>`)}let $="";if(d){let C=parseInt(c.state,10),k=parseInt(l.state,10);if(!isNaN(C)&&!isNaN(k)){let y=l.attributes.cleans_7d,w=y??Math.round(C*k/100),R=`${C} opportunit${C!==1?"ies":"y"} this week`;$=`
        <div class="rpc-presence-analytics" aria-label="Presence cleaning analytics">
          ${`${w} clean${w!==1?"s":""}`} \xB7 ${R}
        </div>
      `}}return`
    <div class="rpc-zone rpc-zone4">
      <div class="rpc-zone-header">SCHEDULE &amp; PRESENCE</div>
      <div class="rpc-schedule-row">
        <div class="rpc-schedule-times">
          ${a?`
            <div class="rpc-next-clean">
              <span class="rpc-schedule-label">Next scheduled</span>
              <span class="rpc-schedule-time">${Ke(a.state,e.language)}</span>
            </div>`:""}
          ${u}
        </div>
        ${g}
      </div>
      ${m}
      ${$}
    </div>
  `}var Se={completed:"#2d9c4f",stuck:"#d97706",error:"#dc2626",cancelled:"#9ca3af",none:"var(--rpc-cell-empty, var(--rpc-grey-light, #e5e7eb))"},B=24,le=2,ae=20,pe=18,Y=B+le;function Te(e=7){return ae+e*Y-le}function Ee(e){return pe+e*Y-le+4}function Je(e,n){return e.toLocaleDateString(n,{month:"short",day:"numeric"})}function Ce(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function Re(e,n,t,o="en-US"){let s=new Map;for(let u of e)s.set(u.date,u);let r=new Date,a=new Date(r);a.setDate(r.getDate()-(n-1));let i=(a.getDay()+6)%7;a.setDate(a.getDate()-i);let c=Math.ceil((n+i)/7),l=[];for(let u=0;u<c;u++)for(let m=0;m<7;m++){let b=new Date(a);b.setDate(a.getDate()+u*7+m),!(b>r)&&l.push({date:b,summary:s.get(Ce(b))??null,col:m,row:u})}let p=Te(),d=Ee(c),h=["Mo","Tu","We","Th","Fr","Sa","Su"],g=`<svg width="${p}" height="${d}" viewBox="0 0 ${p} ${d}" xmlns="http://www.w3.org/2000/svg" role="grid" aria-label="Cleaning history heatmap">`;for(let u=0;u<7;u++){let m=ae+u*Y+B/2;g+=`<text x="${m}" y="13" text-anchor="middle" font-size="9" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${h[u]}</text>`}for(let u of l){let m=ae+u.col*Y,b=pe+u.row*Y,$=u.summary?.result??"none",C=Se[$]??Se.none,k=u.summary?.total??0,y=Je(u.date,o);if(k===0?y+=": no missions":k===1?y+=`: 1 mission, ${$}`:y+=`: ${k} missions, ${$}`,u.col===0){let w=u.date.getDate();g+=`<text x="${ae-3}" y="${b+B/2+3}" text-anchor="end" font-size="9" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${w}</text>`}if(g+=`<g role="gridcell" aria-label="${y}" data-date="${Ce(u.date)}" data-result="${$}" data-total="${k}" style="cursor:pointer">`,g+=`<rect x="${m-2}" y="${b-2}" width="${B+4}" height="${B+4}" fill="transparent" rx="4"/>`,g+=`<rect x="${m}" y="${b}" width="${B}" height="${B}" fill="${C}" rx="3"/>`,k>1){let w=Math.min(k,3);for(let R=0;R<w;R++){let z=m+B-4-R*5,S=b+B-3;g+=`<circle cx="${z}" cy="${S}" r="2" fill="rgba(255,255,255,0.75)"/>`}}g+="</g>"}return g+="</svg>",g}function ze(e){return!e||e.length===0?[]:e.length===5?e:e.every(t=>t<=4)?e.map(t=>t*25):e}function He(e,n,t,o,s,r){let a=((e-t)/(o-t)*100).toFixed(1)+"%",i=((r-n)/(r-s)*100).toFixed(1)+"%";return{left:a,top:i}}function Me(e){return e<=4?e*25:e}function Ae(e,n){if(!e||e.length===0)return"";let t=7,o=e.length<=t?[...e]:Array.from({length:t},(h,g)=>e[Math.round(g/(t-1)*(e.length-1))]),s=Math.max(...o,1),r=o.length,a=6,i=2,c=r*a+(r-1)*i,l=16,p=n>=60?"var(--rpc-green)":n>=40?"var(--rpc-amber)":"var(--rpc-red)",d="";for(let h=0;h<r;h++){let g=h*(a+i),u=Math.max(2,Math.round(o[h]/s*l)),m=l-u;d+=`<rect x="${g}" y="${m}" width="${a}" height="${u}" fill="${p}" rx="1"/>`}return`<svg width="${c}" height="${l}" viewBox="0 0 ${c} ${l}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:inline-block;vertical-align:middle;flex-shrink:0">${d}</svg>`}function Ne(e=4){let n=Te(),t=Ee(e),o=["Mo","Tu","We","Th","Fr","Sa","Su"],s=`<svg width="${n}" height="${t}" viewBox="0 0 ${n} ${t}" xmlns="http://www.w3.org/2000/svg">`;s+="<style>@keyframes rpc-pulse{0%,100%{opacity:.35}50%{opacity:.7}}.rpc-skel{animation:rpc-pulse 1.5s ease-in-out infinite}</style>";for(let r=0;r<7;r++){let a=ae+r*Y+B/2;s+=`<text x="${a}" y="13" text-anchor="middle" font-size="9" fill="var(--secondary-text-color,#9ca3af)" font-family="inherit">${o[r]}</text>`}for(let r=0;r<e;r++)for(let a=0;a<7;a++){let i=ae+a*Y,c=pe+r*Y;s+=`<rect x="${i}" y="${c}" width="${B}" height="${B}" fill="var(--rpc-grey-light, #e5e7eb)" rx="3" class="rpc-skel" style="animation-delay:${(r*7+a)*30}ms"/>`}return s+="</svg>",s}function Pe(e,n,t,o){if(n.show_alerts===!1)return"";let s=o,r=[],a=e.states[`sensor.${s}_last_error_code`];if(a&&a.state!=="0"&&a.state!==""&&a.state!=="unknown"&&a.state!=="unavailable"){let p=f(a.attributes.label??`Error ${a.state}`),d=f(a.attributes.description??""),h=f(a.attributes.action??""),g=[d,h].filter(Boolean).join(" ")||void 0;r.push({priority:1,text:`Error: ${p}`,subtext:g})}let i=e.states[`binary_sensor.${s}_maintenance_due`];if(i&&i.state==="on"){let p=e.states[`sensor.${s}_readiness`]?.state??"",d="Maintenance due";p==="bin_full"||p==="Bin Full"?d="Bin full \u2014 empty to continue":p&&p!=="Ready"&&p!=="unknown"&&p!=="unavailable"&&(d="Robot not ready \u2014 check the app"),r.push({priority:2,text:d})}if(t.hasWearRate){let p=e.states[`sensor.${s}_filter_wear_rate`],d=e.states[`sensor.${s}_filter_remaining_hours`];if(p&&p.state!=="unknown"&&p.state!=="unavailable"&&d){let u=d.attributes.threshold_hours,m=parseFloat(p.state)/(u/90);m>1.5&&r.push({priority:3,text:`Filter wearing ${m.toFixed(1)}\xD7 faster than normal`,subtext:"Check for dust or debris buildup."})}let h=e.states[`sensor.${s}_brush_wear_rate`],g=e.states[`sensor.${s}_brush_remaining_hours`];if(h&&h.state!=="unknown"&&h.state!=="unavailable"&&g){let u=g.attributes.threshold_hours,m=parseFloat(h.state)/(u/90);m>1.5&&r.push({priority:4,text:`Brush wearing ${m.toFixed(1)}\xD7 faster than normal`,subtext:"Check for hair tangles."})}}let c=e.states[`sensor.${s}_nav_quality`];if(c&&c.state!=="unknown"&&c.state!=="unavailable"){let p=parseInt(c.state,10);!isNaN(p)&&p<60&&r.push({priority:5,text:`Navigation quality low (${p}/100)`,subtext:"Check lighting or move obstacles in the cleaning area."})}if(t.hasConsecutiveSkips){let p=e.states[`sensor.${s}_consecutive_clean_skips`];if(p&&p.state!=="unknown"&&p.state!=="unavailable"){let d=parseInt(p.state,10);if(!isNaN(d)&&d>0){let h=`Robot blocked from cleaning ${d} consecutive time${d!==1?"s":""}`;r.push({priority:6,text:h,subtext:"Check blocking sensors or robot placement."})}}}if(t.hasWifiFloor){let p=e.states[`sensor.${s}_recent_wifi_floor`];if(p&&p.state!=="unknown"&&p.state!=="unavailable"){let d=parseInt(p.state,10),h=isNaN(d)?NaN:Me(d);!isNaN(h)&&h<50&&r.push({priority:7,text:`Wi-Fi signal dropped to ${h}% during last mission`,subtext:"Consider moving the router or adding a Wi-Fi extender."})}}if(r.length===0)return"";let l=r.sort((p,d)=>p.priority-d.priority)[0];return`
    <div class="rpc-zone rpc-zone5">
      <div class="rpc-alert-box" role="alert">
        <span class="rpc-alert-icon" aria-hidden="true">\u26A0\uFE0F</span>
        <div class="rpc-alert-content">
          <div class="rpc-alert-text">${l.text}</div>
          ${l.subtext?`<div class="rpc-alert-sub">${l.subtext}</div>`:""}
        </div>
      </div>
    </div>
  `}function De(e,n){return n?`${Math.round(e*.0929)} m\xB2`:`${e} ft\xB2`}function Ge(e){return e==="robot_learned"?"\u{1F6A7}":e==="keepout"?"\u{1F6AB}":"\u{1F4CD}"}function Qe(e){let n=e.room_name?` \xB7 ${e.room_name}`:"";return e.source==="stuck_events"?`Stuck hotspot${e.stuck_count?` (${e.stuck_count}\xD7)`:""}${n}`:e.source==="robot_learned"?`Robot-detected obstacle${n}`:e.source==="keepout"?`Keep-out zone${n}`:"Hazard"}function Le(e,n,t,o,s,r){if(n.show_history===!1)return"";let a=o,i=n.history_days??28,c=n.area_unit??"auto",l=c==="m2"||c==="auto"&&r,{historyTab:p,hazards:d}=s,h=e.states[`sensor.${a}_clean_streak`],g=e.states[`sensor.${a}_completion_rate_30d`],u=h?parseInt(h.state,10):0,m=g?parseInt(g.state,10):NaN,b="",$=[];if(u>0&&$.push(`\u{1F525} ${u}-day streak`),isNaN(m)||$.push(`${m}% completion rate`),t.hasCleaningSpeedTrend){let E=e.states[`sensor.${a}_cleaning_speed_trend`]?.state;E==="declining"?$.push('<span class="rpc-trend-declining">\u2193 Speed declining</span>'):E==="improving"&&$.push('<span class="rpc-trend-improving">\u2191 Speed improving</span>')}$.length&&(b=`<div class="rpc-history-summary">${$.map((S,E)=>E===0?S:`<span class="rpc-summary-sep">\xB7</span>${S}`).join("")}</div>`);let C=t.hasCoverageImage?`
    <div class="rpc-history-tabs">
      <button class="rpc-tab${p==="calendar"?" active":""}" data-history-tab="calendar">Calendar</button>
      <button class="rpc-tab${p==="coverage"?" active":""}" data-history-tab="coverage">Coverage</button>
    </div>`:"",k="";if(t.hasCoverageImage&&p==="coverage"){let E=e.states[`image.${a}_coverage_map`]?.attributes??{},T=E.x_min_mm,_=E.x_max_mm,H=E.y_min_mm,D=E.y_max_mm,v=E.entity_picture,j=E.last_mission_end,O=T!=null&&_!=null&&H!=null&&D!=null,q=O?d.map(M=>{let U=He(M.x_mm,M.y_mm,T,_,H,D),W=f(Qe(M)),Z=Ge(M.source);return`<div class="rpc-hazard-pin rpc-pin-${M.source}" style="left:${U.left};top:${U.top}" title="${W}" aria-label="${W}">${Z}</div>`}).join(""):"",ee=!O&&v?'<div class="rpc-coverage-note">Spatial overlay unavailable \u2014 grid accumulating</div>':"",te=j?`<div class="rpc-coverage-updated">Updated ${K(j,e.language)}</div>`:"",F=d.some(M=>M.source==="stuck_events"),N=d.some(M=>M.source==="robot_learned"),A=d.some(M=>M.source==="keepout"),V=[F?"<span>\u{1F4CD}</span> Stuck hotspot":"",N?"<span>\u{1F6A7}</span> Robot obstacle":"",A?"<span>\u{1F6AB}</span> Keep-out zone":""].filter(Boolean).join(" ");k=v?`
      <div class="rpc-coverage-panel">
        <div class="rpc-coverage-image-wrap">
          <img class="rpc-coverage-img" src="${v}" alt="Coverage map" />
          ${q}
        </div>
        ${ee}
        <div class="rpc-coverage-legend">
          <span style="color:var(--rpc-green)">\u25CF</span> High coverage
          <span style="color:var(--rpc-grey-mid,#9ca3af)">\u25CF</span> Rarely cleaned
          ${V}
        </div>
        ${te}
      </div>`:'<div class="rpc-history-error">Coverage map unavailable</div>'}let y="";s.loading&&!s.data?y=Ne(Math.ceil(i/7)):s.error?y=`<div class="rpc-history-error">${f(s.error)}</div>`:s.data&&(y=Re(s.data,i,c,e.language),s.data.length<i&&(y+=`<div class="rpc-history-partial">Showing ${s.data.length} of ${i} days \u2014 full history builds over time</div>`));let w="";if(t.hasProblemZone){let S=e.states[`sensor.${a}_problem_zone`],E=e.states[`sensor.${a}_stuck_count_30d`];if(S&&S.state!=="unknown"&&S.state!=="unavailable"){let T=E?parseInt(E.state,10):0;T>0&&(w=`<div class="rpc-problem-zone">\u26A0 ${f(S.state)} \u2014 stuck ${T}\xD7 in 30 days</div>`)}}let R="";if(s.openDay){let E=new Date(s.openDay+"T00:00:00").toLocaleDateString(e.language,{weekday:"long",month:"long",day:"numeric",year:"numeric"}),T=s.dayMissions,_=s.openDaySummary,H="";if(T===null)H="";else if(_&&_.total===0)H='<div class="rpc-day-empty">No missions this day</div>';else if(T.length>0)H=T.map(v=>{let j=v.result==="completed"?"\u2713":"\u2717",O=v.result==="completed"?"rpc-day-ok":"rpc-day-err",q=new Date(v.started_at).toLocaleTimeString(e.language,{hour:"2-digit",minute:"2-digit",hour12:!1}),ee=v.area_sqft!==null?De(v.area_sqft,l):"\u2014",te=v.zones?.map(W=>f(W)).join(" \xB7 ")??"",F=n.show_dirt_events&&v.dirt_events!=null&&v.dirt_events>0?`${v.dirt_events} dirt event${v.dirt_events!==1?"s":""}`:"",N=[te,F].filter(Boolean).join(" \xB7 "),A=v.initiator==="demand"?'<span class="rpc-initiator-badge">demand</span>':"",V="";if(v.wifi_signal&&v.wifi_signal.length>0){let W=ze(v.wifi_signal),Z=Math.min(...W),re=Ae(W,Z);V=`<div class="rpc-day-wifi" aria-label="Wi-Fi signal: minimum ${Z}% during mission"><span aria-hidden="true">\u{1F4F6}</span>${re}<span>${Z}% min</span></div>`}let M="";v.room_coverage&&Object.keys(v.room_coverage).length>0&&(M=`<div class="rpc-room-coverage">${Object.entries(v.room_coverage).map(([Z,re])=>{let J=Math.round(re*100);return`<span class="${J>=80?"rpc-cov-green":J>=60?"rpc-cov-amber":"rpc-cov-red"}">${f(Z)} ${J}%</span>`}).join(" \xB7 ")}</div>`);let U="";return v.alignment_confidence!=null&&v.alignment_confidence<.85&&(U=`<div class="rpc-alignment-note">* Coverage estimates (alignment confidence: ${Math.round(v.alignment_confidence*100)}%)</div>`),`
          <div class="rpc-day-mission">
            <span class="rpc-day-icon ${O}">${j}</span>
            <span class="rpc-day-time">${q}</span>
            <span class="rpc-day-dur">${v.duration_min} min</span>
            <span class="rpc-day-area">${ee}</span>
            ${A}
            ${N?`<div class="rpc-day-zones">${N}</div>`:""}
            ${V}
            ${M}
            ${U}
          </div>`}).join("");else if(_&&_.total>0){let v=_.area_sqft!==null?De(_.area_sqft,l):null;H=`
        <div class="rpc-day-aggregate">
          <div>${_.total} mission${_.total>1?"s":""} \xB7 ${f(_.result)}
            ${v?` \xB7 ${v} total`:""}</div>
          <div class="rpc-day-no-detail">Per-mission detail not available</div>
        </div>`}let D=_?.total??0;R=`
      <div class="rpc-popover rpc-day-popover">
        <div class="rpc-popover-header">
          <span>${f(E)}</span>
          <button class="rpc-popover-close" data-close-day="true" aria-label="Close">\xD7</button>
        </div>
        <div class="rpc-popover-divider"></div>
        ${D>0&&T&&T.length>0?`<div class="rpc-day-count">${D} mission${D>1?"s":""}</div>`:""}
        ${H}
      </div>
    `}let z="";if(n.show_lifetime!==!1){let S=e.states[`sensor.${a}_lifetime_missions`],E=e.states[`sensor.${a}_recent_area_30d`],T=e.states[`sensor.${a}_recent_time_30d`],_=S?parseInt(S.state,10):NaN,H=T?parseInt(T.state,10):NaN,D=E?parseFloat(E.state):NaN;if(!isNaN(_)||!isNaN(H)||!isNaN(D)){let j=s.lifetimeExpanded?`
        <div class="rpc-lifetime-stats">
          <span class="rpc-lifetime-arrow">\u2192</span>
          ${isNaN(_)?"":`<span>${_.toLocaleString()} missions</span>`}
          ${isNaN(D)?"":`<span>${D.toLocaleString()} m\xB2</span>`}
          ${isNaN(H)?"":`<span>${H.toLocaleString()} h (30 d)</span>`}
        </div>`:"";z=`
        <div class="rpc-lifetime-divider"></div>
        <button class="rpc-lifetime-toggle" data-lifetime-toggle aria-expanded="${s.lifetimeExpanded}">
          Stats ${s.lifetimeExpanded?"\u25B2":"\u25BC"}
        </button>
        ${j}
      `}}return`
    <div class="rpc-zone rpc-zone6">
      <div class="rpc-zone-header">LAST ${i} DAYS</div>
      ${b}
      ${C}
      <div class="rpc-heatmap-wrap" data-heatmap>
        ${p==="coverage"&&t.hasCoverageImage?k:y}
      </div>
      ${w}
      ${R}
      ${z}
    </div>
  `}var Ie=`
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
`,de=class extends HTMLElement{constructor(){super();this.robotName="";this.activeRobot="";this.selectedRooms=new Set;this.passes="Auto";this.passSettingInFlight=!1;this.isSendingClean=!1;this.sendError=null;this.settingsPanelOpen=!1;this.loadingAction=null;this.locateTimer=null;this.actionResetTimer=null;this.cleanTimeoutTimer=null;this.openPopover=null;this.resetting=null;this.resetError=null;this.legendShown=!1;this.holdTooltipVisible=!1;this.holdToggling=!1;this.holdTooltipTimer=null;this.alertsVisible=!1;this.lastAlertHtml="";this.alertCollapseTimer=null;this.missionData=null;this.firstRecord=null;this.firstSummary=null;this.historyLoading=!1;this.historyError=null;this.openDay=null;this.dayMissions=null;this.openDaySummary=null;this.lifetimeExpanded=!1;this.hazards=[];this.historyTab="calendar";this.apiClient=null;this.prevVacuumState="";this.prevMissionActive="";this.handleOutsideClick=t=>{if(!t.composedPath().includes(this)){let s=!1;this.openPopover!==null&&(this.openPopover=null,s=!0),this.openDay!==null&&(this.openDay=null,this.dayMissions=null,this.openDaySummary=null,s=!0),s&&this.render()}};this.root=this.attachShadow({mode:"open"})}connectedCallback(){document.addEventListener("click",this.handleOutsideClick)}disconnectedCallback(){document.removeEventListener("click",this.handleOutsideClick),[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(t=>{t!==null&&clearTimeout(t)})}setConfig(t){let o=t.entities&&t.entities.length>0?t.entities:[t.entity];if(!o[0])throw new Error("roomba-plus-card: entity is required");let s=this.activeRobot,r=o.includes(s)?s:o[0],a=r!==s;this.config=t,this.activeRobot=r,this.robotName=r.replace("vacuum.",""),a&&this.resetRobotState(),this.root.innerHTML=`<style>${Ie}</style><div class="rpc-card" style="padding:16px;color:var(--secondary-text-color,#9ca3af);font-size:.85rem">Loading\u2026</div>`}set hass(t){let o=this.relevantEntityIds(),s=!this._hass||o.some(l=>t.states[l]?.state!==this._hass.states[l]?.state||t.states[l]?.last_changed!==this._hass.states[l]?.last_changed),r=this._hass;this._hass=t;let a=t.states[`select.${this.robotName}_cleaning_passes`];a&&!this.isSendingClean&&!this.passSettingInFlight&&(this.passes=fe[a.state]??"Auto");let i=`binary_sensor.${this.robotName}_mission_active`,c=t.states[i]?.state??"";if(c)this.prevMissionActive==="on"&&c==="off"&&this.loadHistory(),this.prevMissionActive=c;else{let l=t.states[this.config.entity]?.state??"";this.prevVacuumState==="cleaning"&&l==="docked"&&this.loadHistory(),this.prevVacuumState=l}this.apiClient===null?this.config.show_history!==!1&&(this.apiClient=new ne(t,this.config,this.activeRobot),this.loadHistory()):this.apiClient.updateHass(t),(!r||s)&&this.render()}relevantEntityIds(){let t=this.robotName;return[this.activeRobot,`sensor.${t}_last_error_code`,`sensor.${t}_last_error_zone`,`sensor.${t}_phase`,`binary_sensor.${t}_mission_active`,`binary_sensor.${t}_maintenance_due`,`sensor.${t}_readiness`,`binary_sensor.${t}_schedule_hold_active`,`sensor.${t}_next_clean`,`sensor.${t}_filter_remaining_hours`,`sensor.${t}_brush_remaining_hours`,`sensor.${t}_mop_pad`,`sensor.${t}_mop_tank_level`,`sensor.${t}_mop_behavior`,`sensor.${t}_clean_base_status`,`sensor.${t}_nav_quality`,`sensor.${t}_next_likely_clean_window`,`sensor.${t}_presence_clean_opportunities_7d`,`sensor.${t}_presence_clean_utilisation_7d`,`sensor.${t}_cleaning_passes`,`select.${t}_cleaning_passes`,`select.${t}_smart_zone_select`,`select.${t}_zone_select`,`sensor.${t}_clean_streak`,`sensor.${t}_completion_rate_30d`,`sensor.${t}_lifetime_missions`,`sensor.${t}_recent_area_30d`,`sensor.${t}_recent_time_30d`,`sensor.${t}_battery_capacity_retention`,`sensor.${t}_estimated_battery_eol`,`sensor.${t}_recent_wifi_floor`,`sensor.${t}_recent_coverage_pct`,`sensor.${t}_missions_last_30d`,`sensor.${t}_average_mission_time`,`sensor.${t}_cleaning_speed_trend`,`binary_sensor.${t}_consecutive_clean_skips`,`sensor.${t}_area_cleaned_today`,`sensor.${t}_mission_expire_time`,`image.${t}_coverage_map`,...this.config.robot_selector_helper?[this.config.robot_selector_helper]:[]]}entityList(){return this.config.entities&&this.config.entities.length>0?this.config.entities:[this.config.entity]}resetRobotState(){this.apiClient=null,this.missionData=null,this.firstRecord=null,this.firstSummary=null,this.historyLoading=!1,this.historyError=null,this.selectedRooms=new Set,this.passes="Auto",this.passSettingInFlight=!1,this.openPopover=null,this.legendShown=!1,this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.settingsPanelOpen=!1,this.lifetimeExpanded=!1,this.hazards=[],this.historyTab="calendar",this.prevVacuumState="",this.prevMissionActive="",this.alertsVisible=!1,this.lastAlertHtml="",[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(t=>{t!==null&&clearTimeout(t)})}async switchRobot(t){if(t===this.activeRobot)return;this.activeRobot=t,this.robotName=t.replace("vacuum.",""),this.resetRobotState(),this.config.show_history!==!1&&this._hass&&(this.apiClient=new ne(this._hass,this.config,t),this.loadHistory()),this.render();let o=this.config.robot_selector_helper;if(o&&this._hass.states[o]){let s=o.split(".")[0],r=s==="input_select"?"select_option":"set_value",a=s==="input_select"?{entity_id:o,option:t}:{entity_id:o,value:t};try{await this._hass.callService(s,r,a)}catch(i){console.warn("roomba-plus-card: robot_selector_helper write failed",i)}}}async loadHistory(){if(!this.apiClient||this.historyLoading)return;let t=this.activeRobot;this.historyLoading=!0,this.historyError=null,this.render();try{let o=this.config.history_days??28,s=await this.apiClient.fetchSummary(o),r=await this.apiClient.fetchRecords(o);if(r.length>0){let i=new Map;for(let c of r){let l=c.started_at.slice(0,10);i.has(l)||i.set(l,[]),i.get(l).push(c)}for(let c of s){let l=i.get(c.date);l&&(c.missions=l.sort((p,d)=>p.started_at.localeCompare(d.started_at)))}}let a=await this.apiClient.fetchHazards();this.missionData=s,this.firstRecord=r.length>0?r[r.length-1]:null,this.firstSummary=s.length>0?s[s.length-1]:null,this.hazards=a}catch(o){let s=o.message;this.historyError=s==="404"?"History requires Roomba+ v1.8 or later":"History temporarily unavailable"}finally{if(this.activeRobot!==t)return;this.historyLoading=!1,this.render()}}render(){if(!this.config||!this._hass)return;let t=oe(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),o=this._hass.config?.unit_system?.length==="m",s=new Date,r=`${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,"0")}-${String(s.getDate()).padStart(2,"0")}`,i=(this.missionData?.find(d=>d.date===r)??null)?.total??null,c=Pe(this._hass,this.config,t,this.robotName),l=c;c?(this.alertCollapseTimer!==null&&(clearTimeout(this.alertCollapseTimer),this.alertCollapseTimer=null),this.alertsVisible=!0,this.lastAlertHtml=c):this.alertsVisible&&(this.alertCollapseTimer===null&&(this.alertCollapseTimer=setTimeout(()=>{this.alertsVisible=!1,this.alertCollapseTimer=null,this.render()},100)),l=this.lastAlertHtml);let p=`
      <style>${Ie}</style>
      <div class="rpc-card">
        ${this.renderRobotSelectorBar()}
        ${ye({hass:this._hass,config:this.config,caps:t,robotName:this.robotName,loadingAction:this.loadingAction,todayMissionCount:i,missionData:this.missionData,settingsPanelOpen:this.settingsPanelOpen})}
        ${ve({hass:this._hass,config:this.config,caps:t,robotName:this.robotName,selectedRooms:this.selectedRooms,passes:this.passes,isSending:this.isSendingClean,sendError:this.sendError,settingsPanelOpen:this.settingsPanelOpen})}
        ${we(this._hass,this.config,t,this.robotName,{openPopover:this.openPopover,resetting:this.resetting,resetError:this.resetError,legendShown:this.legendShown})}
        ${ke(this._hass,this.config,t,this.robotName,{holdTooltipVisible:this.holdTooltipVisible,holdToggling:this.holdToggling})}
        ${l}
        ${Le(this._hass,this.config,t,this.robotName,{data:this.missionData,loading:this.historyLoading,error:this.historyError,openDay:this.openDay,dayMissions:this.dayMissions,openDaySummary:this.openDaySummary,lifetimeExpanded:this.lifetimeExpanded,historyTab:this.historyTab,hazards:this.hazards},o)}
      </div>
    `;this.root.innerHTML=p,this.attachEventListeners()}renderRobotSelectorBar(){let t=this.entityList();return t.length<2?"":`<div class="rpc-robot-selector"><select class="rpc-robot-select" data-robot-select>${t.map(s=>{let r=this._hass.states[s]?.attributes?.friendly_name??s,a=s===this.activeRobot?" selected":"";return`<option value="${s}"${a}>${r}</option>`}).join("")}</select></div>`}attachEventListeners(){let t=this.root.querySelector(".rpc-card"),o=t.querySelector("[data-robot-select]");o&&o.addEventListener("change",r=>{r.stopPropagation(),this.switchRobot(r.target.value)}),t.querySelectorAll("[data-action]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation(),this.handleAction(r.dataset.action)})}),t.querySelectorAll("[data-room]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation();let i=r.dataset.room;this.selectedRooms.has(i)?this.selectedRooms.delete(i):this.selectedRooms.add(i),this.render()})}),t.querySelectorAll("[data-pass]").forEach(r=>{r.addEventListener("click",async a=>{a.stopPropagation();let i=r.dataset.pass,c=r.dataset.passOption;this.passes=i,this.render();let l=`select.${this.robotName}_cleaning_passes`;if(this._hass.states[l]){this.passSettingInFlight=!0;try{await this._hass.callService("select","select_option",{entity_id:l,option:c})}catch{}finally{this.passSettingInFlight=!1}}})}),t.querySelectorAll("[data-bar]").forEach(r=>{let a=i=>{i.stopPropagation();let c=r.dataset.bar;this.openPopover=this.openPopover===c?null:c,this.resetError=null,this.render(),!this.legendShown&&this.root.querySelector("[data-wear-legend]")&&(this.legendShown=!0)};r.addEventListener("click",a),r.addEventListener("keydown",i=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),a(i))})}),t.querySelectorAll("[data-close]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation(),this.openPopover=null,this.render()})}),t.querySelectorAll("[data-reset]").forEach(r=>{r.addEventListener("click",async a=>{a.stopPropagation();let i=r.dataset.reset,c=r.dataset.service;this.resetting=i,this.resetError=null,this.render();try{await this._hass.callService("roomba_plus",c,{entity_id:this.config.entity}),await new Promise(l=>setTimeout(l,800)),this.openPopover=null}catch{this.resetError=i}finally{this.resetting=null,this.render()}})}),t.querySelectorAll("[data-hold-action]").forEach(r=>{r.addEventListener("click",async a=>{if(a.stopPropagation(),r.dataset.holdAction==="tooltip")this.holdTooltipVisible=!0,this.render(),this.holdTooltipTimer!==null&&clearTimeout(this.holdTooltipTimer),this.holdTooltipTimer=setTimeout(()=>{this.holdTooltipVisible=!1,this.holdTooltipTimer=null,this.render()},3e3);else{let i=`switch.${this.robotName}_schedule_hold`,c=this._hass.states[i]?.state==="on";this.holdToggling=!0,this.render();try{await this._hass.callService("switch",c?"turn_off":"turn_on",{entity_id:i})}finally{this.holdToggling=!1,this.render()}}})});let s=t.querySelector("[data-heatmap]");s&&s.addEventListener("click",r=>{r.stopPropagation();let a=r.target.closest("[data-date]");if(!a)return;let i=a.getAttribute("data-date");this.openDay===i?(this.openDay=null,this.dayMissions=null,this.openDaySummary=null):(this.openDay=i,this.openDaySummary=this.missionData?.find(c=>c.date===i)??null,this.dayMissions=this.buildDayMissions(i)),this.render()}),t.querySelectorAll("[data-close-day]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation(),this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.render()})}),t.querySelectorAll("[data-settings-toggle]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation(),this.settingsPanelOpen=!this.settingsPanelOpen,this.render()})}),t.querySelectorAll("[data-switch-entity]").forEach(r=>{r.addEventListener("click",async a=>{a.stopPropagation();let i=r.dataset.switchEntity,c=this._hass.states[i]?.state==="on";try{await this._hass.callService("switch",c?"turn_off":"turn_on",{entity_id:i})}catch{}})}),t.querySelectorAll("[data-cycle-entity]").forEach(r=>{r.addEventListener("click",async a=>{a.stopPropagation();let i=r.dataset.cycleEntity,c=JSON.parse(r.dataset.cycleOptions??"[]"),l=r.dataset.cycleCurrent??"",p=c.indexOf(l),d=c.length>0?c[(p+1)%c.length]:null;if(d)try{await this._hass.callService("select","select_option",{entity_id:i,option:d})}catch{}})}),t.querySelectorAll("[data-lifetime-toggle]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation(),this.lifetimeExpanded=!this.lifetimeExpanded,this.render()})}),t.querySelectorAll("[data-history-tab]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation(),this.historyTab=r.dataset.historyTab,this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.render()})})}buildDayMissions(t){let o=this.missionData?.find(s=>s.date===t);return!o||o.total===0?[]:o.missions&&o.missions.length>0?o.missions:[]}async handleAction(t){let{entity:o}=this.config,s=this.robotName;if(t==="clean-selected"){this.isSendingClean=!0,this.sendError=null,this.render();let l=Array.from(this.selectedRooms);this.cleanTimeoutTimer=setTimeout(()=>{this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app",this.cleanTimeoutTimer=null,this.render()},8e3);try{let p=`select.${s}_cleaning_passes`;this.passes!=="Auto"&&this._hass.states[p]&&await this._hass.callService("select","select_option",{entity_id:p,option:ie[this.passes]??this.passes}),await this._hass.callService("roomba_plus","clean_room",{entity_id:o,room_name:l,ordered:!1}),clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null,this.selectedRooms.clear(),this.isSendingClean=!1}catch{this.cleanTimeoutTimer!==null&&(clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null),this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app"}this.render();return}if(t==="repeat-last"){try{await this._hass.callService("button","press",{entity_id:`button.${s}_repeat_mission`})}catch{}return}let a={start:["vacuum","start"],pause:["vacuum","pause"],resume:["vacuum","start"],return_home:["vacuum","return_to_base"],locate:["vacuum","locate"]}[t];if(!a)return;let[i,c]=a;if(this.loadingAction=t,this.render(),t==="locate"){this.locateTimer=setTimeout(()=>{this.loadingAction=null,this.locateTimer=null,this.render()},2e3);try{await this._hass.callService(i,c,{entity_id:o})}catch{}return}this.actionResetTimer=setTimeout(()=>{this.loadingAction=null,this.actionResetTimer=null,this.render()},5e3);try{await this._hass.callService(i,c,{entity_id:o})}finally{this.actionResetTimer!==null&&(clearTimeout(this.actionResetTimer),this.actionResetTimer=null),this.loadingAction=null,this.render()}}getCardSize(){if(!this.config||!this._hass)return 10;let t=oe(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),o=4;return t.hasZones&&this.config.show_rooms!==!1&&(o+=3),this.config.show_health!==!1&&(o+=2),this.config.show_schedule!==!1&&(o+=2),this.config.show_history!==!1&&(o+=4),o}static getConfigForm(){return{schema:[{name:"entity",label:"Robot vacuum",required:!0,selector:{entity:{domain:"vacuum"}}},{name:"entities",label:"Multiple robots (overrides single robot above)",selector:{entity:{domain:"vacuum",multiple:!0}}},{name:"area_unit",label:"Area unit",selector:{select:{options:["auto","sqft","m2"],mode:"dropdown"}}},{name:"history_days",label:"History window",selector:{select:{options:[{value:7,label:"7 days"},{value:14,label:"14 days"},{value:28,label:"28 days"}],mode:"dropdown"}}},{name:"presence_entities",label:"Presence sensors (person.* entities)",selector:{entity:{domain:"person",multiple:!0}}},{name:"show_rooms",label:"Show room selector zone",selector:{boolean:{}}},{name:"show_settings",label:"Show settings panel",selector:{boolean:{}}},{name:"show_health",label:"Show health zone",selector:{boolean:{}}},{name:"show_schedule",label:"Show schedule & presence zone",selector:{boolean:{}}},{name:"show_alerts",label:"Show alerts zone",selector:{boolean:{}}},{name:"show_history",label:"Show history zone",selector:{boolean:{}}},{name:"show_lifetime",label:"Show lifetime stats",selector:{boolean:{}}},{name:"show_dirt_events",label:"Show dirt events in day detail",selector:{boolean:{}}},{name:"robot_selector_helper",label:"Robot selector helper (input_text or input_select \u2014 for xiaomi card sync)",selector:{entity:{domain:["input_text","input_select"]}}}]}}static getStubConfig(){return{entity:"vacuum.roomba"}}};typeof customElements<"u"&&customElements.define("roomba-plus-card",de);typeof window<"u"&&(window.customCards??(window.customCards=[]),window.customCards.push({type:"roomba-plus-card",name:"Roomba+ Card",description:"Full-featured card for the roomba_plus integration",preview:!0,documentationURL:"https://github.com/johnnyh1975/ha_roomba_plus_card"}));
