function xe(t,a,e,r,o){let s=d=>!!t.states[`sensor.${a}_${d}`],n=d=>!!t.states[`select.${a}_${d}`],l=d=>!!t.states[`binary_sensor.${a}_${d}`],i=d=>!!t.states[`image.${a}_${d}`],c=s("mop_pad"),p=s("brush_remaining_hours");return{hasArea:s("area_cleaned_today"),hasBrush:p,hasPad:c,hasWater:s("mop_tank_level"),hasCleanBase:s("clean_base_status"),hasZones:n("smart_zone_select")||n("zone_select"),hasSmartZones:n("smart_zone_select"),hasProblemZone:s("problem_zone"),hasLifetimeArea:s("cleaning_analytics_30d"),hasWearRate:s("filter_wear_rate"),isMop:c&&!p,hasMissionActive:l("mission_active"),hasMissionPhase:s("phase"),hasCleaningSpeedTrend:s("cleaning_performance"),hasBatteryRetention:s("battery_capacity_retention"),hasWifiFloor:s("wifi_health"),hasCoveragePct:s("recent_coverage_pct"),hasBatteryEol:s("estimated_battery_eol"),hasConsecutiveSkips:s("consecutive_clean_skips"),hasMopBehavior:s("mop_behavior"),hasCoverageImage:i("coverage_map"),hasWifiSignal:r?.wifi_signal!=null,hasRoomCoverage:r!=null&&"room_coverage"in r,hasDirtDensity:o!=null&&"dirt_density"in o,hasRobotSelectorHelper:!!e.robot_selector_helper&&!!t.states[e.robot_selector_helper],hasCleanedRooms:Array.isArray(t.states[`vacuum.${a}`]?.attributes?.last_cleaned_rooms)&&(t.states[`vacuum.${a}`]?.attributes?.last_cleaned_rooms).length>0,hasDemandBlocked:l("demand_clean_blocked"),hasEnergyConsumption:s("total_energy_consumed"),hasOptimalWindow:s("optimal_clean_window"),hasRobotHealthScore:s("robot_health_score"),hasNavStats:s("nav_panics")||s("nav_landmark_quality"),hasMaintenanceCalendar:s("wheel_last_cleaned")||s("contact_last_cleaned")||s("bin_last_cleaned"),hasMissionProgressSensor:s("mission_progress"),hasAlignment:(()=>{let d=t.states[`image.${a}_coverage_map`]?.attributes?.rooms;return!!d&&typeof d=="object"&&Object.keys(d).length>0})(),hasFavorites:Object.keys(t.states).some(d=>d.startsWith(`button.${a}_fav_`)),hasConnectivity:l("cloud_connected")||l("mqtt_stale"),hasFirmware:s("firmware_version"),hasPositionTracker:!!t.states[`device_tracker.${a}_position`]}}var ve=class{constructor(a,e,r){this.hass=a;this.entryId=null;this.entityId=r??e.entity}updateHass(a){this.hass=a}async fetchSummary(a){let r=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=summary&days=${a}`,o=await this.hass.fetchWithAuth(r);if(!o.ok)throw new Error(`${o.status}`);return o.json()}async fetchRecords(a){let r=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=records&days=${a}`,o=await this.hass.fetchWithAuth(r);return o.ok?o.json():[]}async getEntryId(){return this.resolveEntryId()}async resolveEntryId(){if(this.entryId)return this.entryId;let a=await this.hass.callWS({type:"config/entity_registry/get",entity_id:this.entityId});return this.entryId=a.config_entry_id,this.entryId}async fetchHazards(){let e=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=hazards`,r=await this.hass.fetchWithAuth(e);return r.ok?r.json():[]}async fetchHousehold(a){let e=`/api/roomba_plus/household?days=${a}`,r=await this.hass.fetchWithAuth(e);return r.ok?r.json():null}};function m(t){return String(t??"").replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}function J(t,a="en"){let e=Date.now()-new Date(t).getTime(),r=Math.floor(e/6e4);try{let o=new Intl.RelativeTimeFormat(a,{numeric:"auto"});if(r<1)return o.format(0,"minute");if(r<60)return o.format(-r,"minute");let s=Math.floor(r/60);if(s<24)return o.format(-s,"hour");let n=Math.floor(s/24);return n<30?o.format(-n,"day"):o.format(-Math.floor(n/30),"month")}catch{if(r<1)return"just now";if(r<60)return`${r}m ago`;let o=Math.floor(r/60);return o<24?`${o}h ago`:`${Math.floor(o/24)}d ago`}}var ie={sofa:"\u{1F6CB}\uFE0F",bed:"\u{1F6CF}\uFE0F","bed-double":"\u{1F6CF}\uFE0F","silverware-fork-knife":"\u{1F37D}\uFE0F",stove:"\u{1F373}",microwave:"\u{1F4E6}",fridge:"\u{1F9CA}",toilet:"\u{1F6BD}",shower:"\u{1F6BF}",bathtub:"\u{1F6C1}",desk:"\u{1F5A5}\uFE0F","chair-rolling":"\u{1F4BA}",television:"\u{1F4FA}",bookshelf:"\u{1F4DA}",wardrobe:"\u{1F454}",home:"\u{1F3E0}",garage:"\u{1F697}",door:"\u{1F6AA}",stairs:"\u{1FA9C}",balcony:"\u{1F305}",pool:"\u{1F3CA}","washing-machine":"\u{1FAE7}",hanger:"\u{1F9F9}","baby-carriage":"\u{1F37C}",dog:"\u{1F415}",cat:"\u{1F408}","floor-plan":"\u{1F4D0}","map-marker":"\u{1F4CD}",star:"\u2B50",heart:"\u2764\uFE0F","office-building":"\u{1F3E2}",school:"\u{1F3EB}"},Me="\u{1F4CD}";var $e={Auto:"Auto","\xD71":"One pass","\xD72":"Two passes"},Ae={Auto:"Auto","One pass":"\xD71","Two passes":"\xD72"};function we(t,a,e,r,o=!1){if(a.show_settings===!1)return"";let s=e,n=t.states[`switch.${s}_edge_clean`],l=t.states[`switch.${s}_always_finish`],i=t.states[`select.${s}_carpet_boost_select`];if(!n&&!l&&!i)return"";let c="";if(r){let u=n?.state==="on",f=l?.state==="on",w=i?i.attributes.options??[]:[];c=`
      <div class="rpc-settings-panel">
        ${n?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Edge clean</span>
            <button class="rpc-setting-toggle${u?" rpc-setting-on":""}"
                    data-switch-entity="switch.${s}_edge_clean"
                    aria-pressed="${u}">
              ${u?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${l?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Always finish</span>
            <button class="rpc-setting-toggle${f?" rpc-setting-on":""}"
                    data-switch-entity="switch.${s}_always_finish"
                    aria-pressed="${f}">
              ${f?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${i?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Carpet boost</span>
            <button class="rpc-setting-cycle"
                    data-cycle-entity="select.${s}_carpet_boost_select"
                    data-cycle-options="${m(JSON.stringify(w))}"
                    data-cycle-current="${m(i.state)}">
              ${m(i.state)} \u25BC
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
  `}function ye(t){let{hass:a,config:e,caps:r,robotName:o,selectedRooms:s,passes:n,isSending:l,sendError:i,settingsPanelOpen:c,includeSettingsPanel:p=!0}=t;if(!r.hasSmartZones||e.show_rooms===!1)return"";let d=o,u=a.states[`select.${d}_smart_zone_select`];if(!u)return"";let f=u.attributes.options??[];if(f.length===0)return"";let w=a.states[`button.${d}_repeat_mission`],h=!!w&&w.state!=="unavailable",v=a.states[`select.${d}_cleaning_passes`],x=r.isMop?"\u25B6 Mop selected rooms":"\u25B6 Clean selected rooms",_=s.size,$='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',k=(()=>{let D=r.hasSmartZones?`select.${o}_smart_zone_select`:`select.${o}_zone_select`,E=a.states[D]?.attributes?.region_icons;return E&&typeof E=="object"&&!Array.isArray(E)?E:{}})(),S=f.map(D=>{let E=s.has(D),te=k[D],q=te?ie[te]??Me:"",Z=q?`${q} ${m(D)}`:m(D);return`<button class="rpc-room-chip${E?" rpc-room-chip--selected":""}"
      data-room="${m(D)}" aria-pressed="${E}">${Z}</button>`}).join(""),C="";if(v){let D=n;C=`
      <div class="rpc-passes-row">
        <span class="rpc-passes-label">Passes:</span>
        ${["Auto","\xD71","\xD72"].map(E=>`<button class="rpc-pass-chip${D===E?" rpc-pass-chip--selected":""}"
            data-pass="${E}"
            data-pass-option="${m($e[E]??E)}">${E}</button>`).join("")}
      </div>
    `}let M=p?we(a,e,o,c):"";return`
    <div class="rpc-zone rpc-zone2">
      <div class="rpc-zone-header">ROOMS</div>
      <div class="rpc-chips-row">
        ${S}
        ${_>0?`<span class="rpc-selected-count">${_} selected</span>`:""}
      </div>
      ${C}
      <div class="rpc-room-actions">
        <button class="rpc-btn rpc-btn-primary${_===0||l?" rpc-btn-disabled":""}"
                data-action="clean-selected"
                ${_===0||l?"disabled":""}
                aria-label="${x}">
          ${l?$+" Sending\u2026":x}
        </button>
        ${h?'<button class="rpc-btn-text" data-action="repeat-last">\u21A9 Repeat last</button>':""}
      </div>
      ${i?`<div class="rpc-send-error">${m(i)}</div>`:""}
      ${M}
    </div>
  `}var De={completed:"#2d9c4f",stuck:"#d97706",error:"#dc2626",cancelled:"#9ca3af",none:"var(--rpc-cell-empty, var(--rpc-grey-light, #e5e7eb))"},G=24,ke=2,ge=20,Se=18,oe=G+ke;function Pe(t=7){return ge+t*oe-ke}function Ne(t){return Se+t*oe-ke+4}function ft(t,a){return t.toLocaleDateString(a,{month:"short",day:"numeric"})}function ze(t){return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}function Ie(t,a,e,r="en-US",o=!1){let s=new Map;for(let h of t)s.set(h.date,h);let n=new Date,l=new Date(n);l.setDate(n.getDate()-(a-1));let i=(l.getDay()+6)%7;l.setDate(l.getDate()-i);let c=Math.ceil((a+i)/7),p=[];for(let h=0;h<c;h++)for(let v=0;v<7;v++){let y=new Date(l);y.setDate(l.getDate()+h*7+v),!(y>n)&&p.push({date:y,summary:s.get(ze(y))??null,col:v,row:h})}let d=Pe(),u=Ne(c),f=["Mo","Tu","We","Th","Fr","Sa","Su"],w=`<svg width="${d}" height="${u}" viewBox="0 0 ${d} ${u}" xmlns="http://www.w3.org/2000/svg" role="grid" aria-label="Cleaning history heatmap">`;for(let h=0;h<7;h++){let v=ge+h*oe+G/2;w+=`<text x="${v}" y="13" text-anchor="middle" font-size="9" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${f[h]}</text>`}for(let h of p){let v=ge+h.col*oe,y=Se+h.row*oe,x=h.summary?.result??"none",_=De[x]??De.none,$=h.summary?.total??0,k=ft(h.date,r);if($===0?k+=": no missions":$===1?k+=`: 1 mission, ${x}`:k+=`: ${$} missions, ${x}`,h.col===0){let C=h.date.getDate();w+=`<text x="${ge-3}" y="${y+G/2+3}" text-anchor="end" font-size="9" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${C}</text>`}let S="";if(o&&h.summary?.relative_to_baseline!=null){let C=h.summary.relative_to_baseline;S=` opacity="${Math.min(1,Math.max(.5,.5+C/4)).toFixed(2)}"`}if(w+=`<g role="gridcell" aria-label="${k}" data-date="${ze(h.date)}" data-result="${x}" data-total="${$}" style="cursor:pointer">`,w+=`<rect x="${v-2}" y="${y-2}" width="${G+4}" height="${G+4}" fill="transparent" rx="4"/>`,w+=`<rect x="${v}" y="${y}" width="${G}" height="${G}" fill="${_}" rx="3"${S}/>`,$>1){let C=Math.min($,3);for(let M=0;M<C;M++){let D=v+G-4-M*5,E=y+G-3;w+=`<circle cx="${D}" cy="${E}" r="2" fill="rgba(255,255,255,0.75)"/>`}}w+="</g>"}return w+="</svg>",w}function Le(t){if(!t||t.length!==5)return null;let a=t.reduce((r,o)=>r+o,0);if(a===0)return null;let e=t.reduce((r,o,s)=>r+s*o,0)/a;return Math.round(e/4*100*10)/10}function Oe(t){if(!t||t.length===0)return[];if(t.length===5){let e=t.reduce((r,o)=>r+o,0);return e===0?[0,0,0,0,0]:t.map(r=>Math.round(r/e*100))}return t.every(e=>e<=4)?t.map(e=>e*25):t}function Ce(t,a,e,r,o,s){let n=((t-e)/(r-e)*100).toFixed(1)+"%",l=((s-a)/(s-o)*100).toFixed(1)+"%";return{left:n,top:l}}function Fe(t,a,e,r,o,s){let n=(t-e)/(r-e)*100,l=(s-a)/(s-o)*100;return{x:n,y:l}}function Be(t){return t<=4?t*25:t}function je(t,a){if(!t||t.length===0)return"";let e=7,r=t.length<=e?[...t]:Array.from({length:e},(u,f)=>t[Math.round(f/(e-1)*(t.length-1))]),o=Math.max(...r,1),s=r.length,n=6,l=2,i=s*n+(s-1)*l,c=16,p=a>=60?"var(--rpc-green)":a>=40?"var(--rpc-amber)":"var(--rpc-red)",d="";for(let u=0;u<s;u++){let f=u*(n+l),w=Math.max(2,Math.round(r[u]/o*c)),h=c-w;d+=`<rect x="${f}" y="${h}" width="${n}" height="${w}" fill="${p}" rx="1"/>`}return`<svg width="${i}" height="${c}" viewBox="0 0 ${i} ${c}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:inline-block;vertical-align:middle;flex-shrink:0">${d}</svg>`}function We(t=4){let a=Pe(),e=Ne(t),r=["Mo","Tu","We","Th","Fr","Sa","Su"],o=`<svg width="${a}" height="${e}" viewBox="0 0 ${a} ${e}" xmlns="http://www.w3.org/2000/svg">`;o+="<style>@keyframes rpc-pulse{0%,100%{opacity:.35}50%{opacity:.7}}.rpc-skel{animation:rpc-pulse 1.5s ease-in-out infinite}</style>";for(let s=0;s<7;s++){let n=ge+s*oe+G/2;o+=`<text x="${n}" y="13" text-anchor="middle" font-size="9" fill="var(--secondary-text-color,#9ca3af)" font-family="inherit">${r[s]}</text>`}for(let s=0;s<t;s++)for(let n=0;n<7;n++){let l=ge+n*oe,i=Se+s*oe;o+=`<rect x="${l}" y="${i}" width="${G}" height="${G}" fill="var(--rpc-grey-light, #e5e7eb)" rx="3" class="rpc-skel" style="animation-delay:${(s*7+n)*30}ms"/>`}return o+="</svg>",o}function Ze(t,a,e){let r=e,o=[],s=t.states[`sensor.${r}_last_error_code`];if(s&&s.state!=="0"&&s.state!==""&&s.state!=="unknown"&&s.state!=="unavailable"){let i=m(s.attributes.label??`Error ${s.state}`),c=m(s.attributes.description??""),p=m(s.attributes.action??""),d=[c,p].filter(Boolean).join(" ")||void 0;o.push({priority:1,text:`Error: ${i}`,subtext:d,category:"none"})}let n=t.states[`binary_sensor.${r}_maintenance_due`];if(n&&n.state==="on"){let i=t.states[`sensor.${r}_readiness`]?.state??"",c="Maintenance due";i==="bin_full"||i==="Bin Full"?c="Bin full \u2014 empty to continue":i&&i!=="Ready"&&i!=="unknown"&&i!=="unavailable"&&(c="Robot not ready \u2014 check the app"),o.push({priority:2,text:c,category:"health"})}if(a.hasWearRate){let i=t.states[`sensor.${r}_filter_wear_rate`],c=t.states[`sensor.${r}_filter_remaining_hours`];if(i&&i.state!=="unknown"&&i.state!=="unavailable"&&c){let u=c.attributes.threshold_hours,f=parseFloat(i.state)/(u/90);f>1.5&&o.push({priority:3,text:`Filter wearing ${f.toFixed(1)}\xD7 faster than normal`,subtext:"Check for dust or debris buildup.",category:"health"})}let p=t.states[`sensor.${r}_brush_wear_rate`],d=t.states[`sensor.${r}_brush_remaining_hours`];if(p&&p.state!=="unknown"&&p.state!=="unavailable"&&d){let u=d.attributes.threshold_hours,f=parseFloat(p.state)/(u/90);f>1.5&&o.push({priority:4,text:`Brush wearing ${f.toFixed(1)}\xD7 faster than normal`,subtext:"Check for hair tangles.",category:"health"})}}let l=t.states[`sensor.${r}_nav_quality`];if(l&&l.state!=="unknown"&&l.state!=="unavailable"){let i=parseInt(l.state,10);!isNaN(i)&&i<60&&o.push({priority:5,text:`Navigation quality low (${i}/100)`,subtext:"Check lighting or move obstacles in the cleaning area.",category:"health"})}if(a.hasConsecutiveSkips){let i=t.states[`sensor.${r}_consecutive_clean_skips`];if(i&&i.state!=="unknown"&&i.state!=="unavailable"){let c=parseInt(i.state,10);if(!isNaN(c)&&c>0){let p=`Robot blocked from cleaning ${c} consecutive time${c!==1?"s":""}`;o.push({priority:6,text:p,subtext:"Check blocking sensors or robot placement.",category:"health"})}}}if(a.hasWifiFloor){let i=t.states[`sensor.${r}_wifi_health`],c=i?.attributes?.weakest_bucket_observed;if(i&&typeof c=="number"&&!isNaN(c)){let p=Be(c);p<50&&o.push({priority:7,text:`Wi-Fi signal dropped to ${p}% during last mission`,subtext:"Consider moving the router or adding a Wi-Fi extender.",category:"history"})}}return o}function Re(t,a,e,r){return Ze(t,a,e).some(o=>o.category===r)}function Ve(t,a,e,r){if(a.show_alerts===!1)return"";let o=Ze(t,e,r);if(o.length===0)return"";let s=o.sort((n,l)=>n.priority-l.priority)[0];return`
    <div class="rpc-zone rpc-zone5">
      <div class="rpc-alert-box" role="alert">
        <span class="rpc-alert-icon" aria-hidden="true">\u26A0\uFE0F</span>
        <div class="rpc-alert-content">
          <div class="rpc-alert-text">${s.text}</div>
          ${s.subtext?`<div class="rpc-alert-sub">${s.subtext}</div>`:""}
        </div>
      </div>
    </div>
  `}function qe(t,a,e,r,o){if((a.entities?.length??0)<2||!r)return"";let s=a.area_unit??"auto",n=s==="m2"||s==="auto"&&o;function l(h){return h==null?"":n?`${Math.round(h*.0929)} m\xB2`:`${Math.round(h)} ft\xB2`}function i(h){return h>=90?"rpc-cov-green":h>=70?"rpc-cov-amber":"rpc-cov-red"}let c=r.robots.map(h=>{let v=Math.round(h.completion_pct),y=l(h.area_sqft),x=[`${h.missions} mission${h.missions!==1?"s":""}`,y].filter(Boolean).join(" \xB7 ");return`
      <div class="rpc-household-robot">
        <span class="rpc-household-name">${m(h.name)}</span>
        <span class="${i(v)}">${v}%</span>
        <span class="rpc-household-meta">${x}</span>
      </div>`}).join(""),p="";r.floors&&r.floors.length>1&&(p=`<div class="rpc-household-floors">${r.floors.map(v=>{let y=l(v.area_sqft),x=[`${v.missions} mission${v.missions!==1?"s":""}`,y].filter(Boolean).join(" \xB7 ");return`
        <div class="rpc-household-floor">
          <span class="rpc-household-floor-label">${m(v.label)}</span>
          <span class="rpc-household-meta">${x}</span>
        </div>`}).join("")}</div>`);let d=r.total,u=Math.round(d.completion_pct),f=l(d.area_sqft),w=[`${d.missions} mission${d.missions!==1?"s":""}`,f].filter(Boolean).join(" \xB7 ");return`
    <div class="rpc-zone rpc-zone7">
      <div class="rpc-zone-header">HOUSEHOLD \u2014 LAST ${r.period_days} DAYS</div>
      ${c}
      ${p}
      <div class="rpc-household-divider"></div>
      <div class="rpc-household-robot rpc-household-combined">
        <span class="rpc-household-name">Combined</span>
        <span class="${i(u)}">${u}%</span>
        <span class="rpc-household-meta">${w}</span>
      </div>
    </div>`}function le(t,a){return t.states[a]?.state??"unavailable"}function Ke(t,a,e){return a==="m2"||a==="auto"&&e?`${Math.round(t*.0929)} m\xB2`:`${t} ft\xB2`}function yt(t,a){if(!t)return null;for(let e=t.length-1;e>=0;e--){let r=t[e];if(r.missions&&r.missions.length>0)for(let o=r.missions.length-1;o>=0;o--){let s=r.missions[o];if(s.result==="completed")return J(s.started_at,a)}else if(r.completed>0)return J(r.date+"T12:00:00Z",a)}return null}function _t(t){let a=["th","st","nd","rd"],e=t%100;return t+(a[(e-20)%10]??a[e]??a[0])}function Ue(t){let{hass:a,config:e,caps:r,robotName:o,loadingAction:s,todayMissionCount:n,roomPickerOpen:l,selectedRoomCount:i}=t,c=t.activeRobot??e.entity,p=le(a,c),d=a.states[c]?.attributes??{},u=a.config?.unit_system?.length==="m",f=e.area_unit??"auto",w=p==="unavailable",h=s!==null,v=o,y=`sensor.${v}_last_error_code`,x=`sensor.${v}_last_error_zone`,_=`sensor.${v}_mission_recharge_time`,$=`sensor.${v}_average_mission_time`,k=`sensor.${v}_area_cleaned_today`,S=d.mission_elapsed_min??null,C=d.mission_area_sqft??null,M=parseFloat(le(a,$)),D=isNaN(M)||M<=0?45:M,E=r.isMop,te=E?"\u{1F9F9}":"\u{1F916}",q=m(d.friendly_name??c),Z=a.states[`sensor.${v}_phase`]?.state??"",ce=(a.states[`binary_sensor.${v}_mission_active`]?.state??"")==="on",pe=r.hasMissionActive,F=a.states[`sensor.${v}_mission_expire_time`]?.state??"",H=F&&F!=="unavailable"&&F!=="unknown"?new Date(F):null,L=!!H&&!isNaN(H.getTime())&&H>new Date,P=L?Math.max(1,Math.round((H.getTime()-Date.now())/6e4)):null,z=!1;if(pe)z=p==="docked"&&ce;else{let g=le(a,_);z=p==="docked"&&(g!=="unavailable"&&g!=="unknown"&&F!=="unavailable"&&F!=="unknown")&&L}let K="";if(z&&r.hasMissionProgressSensor){let R=a.states[`sensor.${v}_mission_progress`]?.attributes?.recharge_min;typeof R=="number"&&(K=`<div class="rpc-recharge-line">\u26A1 Recharging \xB7 ${Math.round(R)} min</div>`)}let b="",W="",U="";if(Z==="evac")b="\u2B06",W="Emptying bin";else if(z)b="\u26A1",W=P!==null?`Recharging \u2014 resuming in ~${P} min`:"Recharging \u2014 mission continues";else switch(p){case"cleaning":b="\u25CF",W=E?"Mopping":"Cleaning";break;case"paused":b="\u23F8",W="Paused";break;case"returning":b="\u21A9",W="Returning to dock";break;case"docked":b="\u2713",W="Docked";break;case"idle":b="\u25CB",W="Idle";break;case"error":b="\u26A0",W="Error",U="rpc-error-state";break;case"unavailable":b="\u2014",W="Unavailable";break}let de="";if(p==="error"){let g=a.states[y];if(g&&g.state!=="0"&&g.state!==""&&g.state!=="unavailable"){let R=m(g.attributes.description??"Unknown error"),I=m(g.attributes.action??""),A=le(a,x),Y=A&&A!=="unknown"&&A!=="unavailable";W=`Error ${m(g.state)} \u2014 ${R}`,de=`
        ${I?`<div class="rpc-error-action">${I}</div>`:""}
        ${Y?`<div class="rpc-error-zone">Zone: ${m(A)}</div>`:""}
      `}else W="Robot error \u2014 check the iRobot app"}let ue="";if((pe?ce:p==="cleaning"||z)&&r.hasArea){let g=parseFloat(le(a,k));if(!isNaN(g)&&g>0){let R=Ke(g,f,u),I=n!==null?n+1:null,A=I!==null&&I>1?` \xB7 ${m(_t(I))} mission`:"";ue=`<div class="rpc-area-today">${R} already today${A}</div>`}}let me="";p==="cleaning"&&S!==null&&(me=`<div class="rpc-progress-track"><div class="rpc-progress-fill" style="width:${Math.min(S/D*100,95)}%"></div></div>`);let re="";if(p==="cleaning")if(r.hasMissionProgressSensor){let g=a.states[`sensor.${v}_mission_progress`],R=g?.attributes?.current_room,I=g&&g.state!=="unavailable"&&g.state!=="unknown"?parseFloat(g.state):NaN;if(R||!isNaN(I)){let A=[];R&&A.push(m(R)),isNaN(I)||A.push(`${Math.round(I)}%`),re=`<div class="rpc-spatial-line">${A.join(" \xB7 ")}</div>`}}else{let g=d.mission_destination;g&&(re=`<div class="rpc-spatial-line">\u2192 Targeting: ${m(g)}</div>`)}let he="";if(p==="cleaning"){let g=[];if(S!==null){let R=Math.max(0,Math.round(D-S));g.push(`<div class="rpc-metric"><span class="rpc-metric-val">~${R} min</span><span class="rpc-metric-lbl">Remaining</span></div>`)}if(r.hasArea&&C!==null){g.push(`<div class="rpc-metric"><span class="rpc-metric-val">${Ke(C,f,u)}</span><span class="rpc-metric-lbl">Cleaned</span></div>`);let R=parseFloat(le(a,`sensor.${v}_cleaning_analytics_30d`)),I=parseFloat(le(a,`sensor.${v}_missions_last_30d`)),A=!isNaN(R)&&!isNaN(I)&&I>=5?R/I:NaN;if(!isNaN(A)&&A>0){let Y=Math.round((C-A)/A*100),fe=Y>=0?"\u25B2":"\u25BC",bt=Y>=0?"rpc-delta-up":"rpc-delta-down";g.push(`<div class="rpc-metric"><span class="rpc-metric-val ${bt}">${fe} ${Math.abs(Y)}%</span><span class="rpc-metric-lbl">vs usual</span></div>`)}}g.length&&(he=`<div class="rpc-metrics-row">${g.join("")}</div>`)}let ae="";if(p==="docked"&&!z){let g=yt(t.missionData,a.language);if(g)ae=`<div class="rpc-docked-since">Last cleaned: ${g}</div>`;else{let R=a.states[c]?.last_changed;R&&(ae=`<div class="rpc-docked-since">Last mission: ${J(R,a.language)}</div>`)}}let ne="";r.hasDemandBlocked&&a.states[`binary_sensor.${v}_demand_clean_blocked`]?.state==="on"&&(ne='<div class="rpc-demand-blocked">\u{1F9F9} Floor needs cleaning \u2014 waiting for home to be empty</div>');let O="";if(r.hasCleanedRooms&&(p==="docked"||p==="idle")&&!z){let g=d.last_cleaned_rooms,R=d.region_icons;g&&g.length>0&&(O=`<div class="rpc-cleaned-rooms">${g.map(A=>{let Y=R?.[A],fe=Y?ie[Y]??"":"";return`<span class="rpc-cleaned-chip">${fe?fe+"\xA0":""}${m(A)}</span>`}).join("")}</div>`)}let Q="";if(r.hasConnectivity){let g=a.states[`binary_sensor.${v}_cloud_connected`]?.state,R=a.states[`binary_sensor.${v}_mqtt_stale`]?.state,I=g==="off",A=R==="on";if(I||A){let Y=A?"Robot offline":"Cloud offline";Q=`<span class="rpc-connectivity rpc-connectivity-degraded" title="${m(Y)}">\u2601 ${m(Y)}</span>`}}let se="";if(r.hasFirmware){let g=a.states[`sensor.${v}_firmware_version`],R=g?.state;if(R&&R!=="unavailable"&&R!=="unknown"){let I=g?.last_changed?new Date(g.last_changed).getTime():0;I>0&&Date.now()-I<24*60*60*1e3&&(se=`<span class="rpc-firmware-badge" title="Firmware updated">\u2B06 FW ${m(R)}</span>`)}}let ee="",B=new Set(["Docked","Angedockt","Cleaning","Unterwegs","unknown","unavailable"]),j=re!=="";if(r.hasPositionTracker&&!j&&(p==="cleaning"||pe&&ce)){let g=a.states[`device_tracker.${v}_position`]?.state;g&&!B.has(g)&&(ee=`<div class="rpc-current-room">\u{1F4CD} ${m(g)}</div>`)}let V='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',N=(g,R,I)=>{let A=s===g;return`<button class="rpc-btn${A?" rpc-btn-loading":""}"
      data-action="${g}"
      ${w||h?"disabled":""}
      aria-label="${R}">
      ${A?V:I}
    </button>`},T="",X=r.hasDemandBlocked&&a.states[`binary_sensor.${v}_demand_clean_blocked`]?.state==="on";return p==="cleaning"||Z==="evac"?T=N("pause","Pause","\u23F8 Pause")+N("return_home","Return home","\u{1F3E0} Return home"):p==="paused"?T=N("resume","Resume","\u25B6 Resume")+N("return_home","Return home","\u{1F3E0} Return home")+N("stop","Stop","\u23F9 Stop"):p==="error"?T=N("return_home","Return home","\u{1F3E0} Return home")+N("retry","Retry","\u{1F504} Retry"):z?T=N("return_home","Cancel mission","\u2715 Cancel mission"):p!=="returning"&&!w&&(i>0?T=N("clean-selected","Start selected rooms",`\u25B6 Start ${i} selected room${i!==1?"s":""}`):(T=N("start","Start full clean",X?"\u25B6 Start anyway":"\u25B6 Start full clean"),e.mode!=="companion"&&r.hasSmartZones&&(T+=`<button class="rpc-btn" data-action="toggle-room-picker" aria-expanded="${l}">
          \u{1F5FA} Rooms\u2026
        </button>`))),`
    <div class="rpc-header${U?" "+U:""}">
      <div class="rpc-robot-identity">
        <span class="rpc-robot-icon">${te}</span>
        <span class="rpc-robot-name">${q}</span>
        ${se}
        ${Q}
      </div>
      <div class="rpc-state-row">
        <span class="rpc-state-dot rpc-state-${p}">${b}</span>
        <span class="rpc-state-label">${W}</span>
      </div>
      ${ue}
      ${de}
      ${me}
      ${re}
      ${ee}
      ${K}
      ${he}
      ${ae}
      ${ne}
      ${O}
      ${T?`<div class="rpc-actions">${T}</div>`:""}
    </div>
  `}function Ye(t,a){let e=[];return t.mode!=="companion"&&a.hasCoverageImage&&e.push({id:"map",icon:"\u{1F5FA}",label:"Map"}),e.push({id:"history",icon:"\u{1F4C5}",label:"History"}),e.push({id:"health",icon:"\u2764",label:"Health"}),e.push({id:"settings",icon:"\u2699",label:""}),e}function Te(t,a){return t.default_tab?t.default_tab:t.mode!=="companion"&&a.hasCoverageImage?"map":"history"}function Ge(t,a,e){let r=e;if(a.hasRobotHealthScore){let o=t.states[`sensor.${r}_robot_health_score`];if(o&&o.state!=="unknown"&&o.state!=="unavailable"){let s=parseFloat(o.state);if(!isNaN(s)&&s<60)return!0}}if(a.hasMaintenanceCalendar){let o=[`sensor.${r}_wheel_last_cleaned`,`sensor.${r}_contact_last_cleaned`,`sensor.${r}_bin_last_cleaned`],s=Date.now();for(let n of o){let l=t.states[n];if(!l||l.state==="unavailable"||l.state==="unknown")continue;let i=new Date(l.state).getTime();if(!isNaN(i)&&(s-i)/864e5>90)return!0}}return!!Re(t,a,e,"health")}function Je(t,a,e){return Re(t,a,e,"history")}function Qe(t,a,e={}){return`
    <div class="rpc-tab-bar" role="tablist">
      ${t.map(r=>`
        <button class="rpc-tab-btn${r.id===a?" rpc-tab-btn--active":""}"
                role="tab" aria-selected="${r.id===a}"
                data-tab="${r.id}">
          <span class="rpc-tab-icon">${r.icon}</span>${r.label?`<span class="rpc-tab-label">${r.label}</span>`:""}
          ${e[r.id]?'<span class="rpc-tab-badge"></span>':""}
        </button>
      `).join("")}
    </div>
  `}var xt=[["[data-action]","action"],["[data-room]","room"],["[data-pass]","pass"],["[data-bar]","bar"],["[data-tab]","tab"],["[data-household-back]","household-back"],["[data-room-poly]","room-overlay"],["[data-room-label]","room-overlay"],["[data-close]","close"],["[data-health-details-toggle]","health-details-toggle"],["[data-nav-details-toggle]","nav-details-toggle"],["[data-maint]","maint"],["[data-close-maint]","close-maint"],["[data-reset]","reset"],["[data-hold-action]","hold-action"],["[data-date]","heatmap-cell"],["[data-close-day]","close-day"],["[data-settings-toggle]","settings-toggle"],["[data-switch-entity]","switch-entity"],["[data-cycle-entity]","cycle-entity"],["[data-lifetime-toggle]","lifetime-toggle"],["[data-history-tab]","history-tab"],["[data-fav-entity]","fav-entity"]];function Xe(t){if(!t)return null;for(let[a,e]of xt){let r=t.closest(a);if(r)return{key:e,el:r}}return null}var $t=[["[data-bar]","bar"],["[data-maint]","maint"]];function et(t){if(!t)return null;for(let[a,e]of $t){let r=t.closest(a);if(r)return{key:e,el:r}}return null}var wt=["show_rooms","show_health","show_schedule","show_alerts","show_history","show_lifetime","show_dirt_events"];function tt(){return[{name:"entity",label:"Robot vacuum",required:!0,selector:{entity:{domain:"vacuum"}}},{name:"entities",label:"Multiple robots (overrides single robot above)",selector:{entity:{domain:"vacuum",multiple:!0}}},{name:"mode",label:"Mode",selector:{select:{mode:"dropdown",options:[{value:"standalone",label:"Standalone \u2014 card owns the Map tab & room selection"},{value:"companion",label:"Companion \u2014 external map card handles spatial view"}]}}},{name:"default_tab",label:"Default tab on load",selector:{select:{mode:"dropdown",options:[{value:"map",label:"Map"},{value:"history",label:"History"},{value:"health",label:"Health"},{value:"settings",label:"Settings"}]}}},{name:"area_unit",label:"Area unit",selector:{select:{options:["auto","sqft","m2"],mode:"dropdown"}}},{name:"history_days",label:"History window",selector:{select:{options:[{value:7,label:"7 days"},{value:14,label:"14 days"},{value:28,label:"28 days"}],mode:"dropdown"}}},{name:"presence_entities",label:"Presence sensors (person.* entities)",selector:{entity:{domain:"person",multiple:!0}}},{name:"robot_selector_helper",label:"Robot selector helper (input_text or input_select \u2014 for xiaomi card sync)",selector:{entity:{domain:["input_text","input_select"]}}},{name:"",type:"expandable",title:"Advanced \u2014 content visibility",schema:wt.map(t=>({name:t,label:kt[t],selector:{boolean:{}}}))}]}var kt={show_rooms:"Room selector (SMART robots, Map tab)",show_health:"Health tab content",show_schedule:"Schedule & presence content",show_alerts:"Alert banners",show_history:"History tab content",show_lifetime:"Lifetime stats (History tab)",show_dirt_events:"Dirt events in day detail"};function rt(t,a){return!(t&&a&&t!==a)}function at(t,a){return a?`${Math.round(t*.0929)} m\xB2`:`${t} ft\xB2`}function St(t){return t==="robot_learned"?"\u{1F6A7}":t==="keepout"?"\u{1F6AB}":"\u{1F4CD}"}function Ct(t){let a=t.room_name?` \xB7 ${t.room_name}`:"";return t.source==="stuck_events"?`Stuck hotspot${t.stuck_count?` (${t.stuck_count}\xD7)`:""}${a}`:t.source==="robot_learned"?`Robot-detected obstacle${a}`:t.source==="keepout"?`Keep-out zone${a}`:"Hazard"}function Ee(t,a,e,r,o,s){if(a.show_history===!1)return"";let n=r,l=a.history_days??28,i=a.area_unit??"auto",c=i==="m2"||i==="auto"&&s,{historyTab:p,hazards:d,mapSelectedRooms:u,suppressSubTabToggle:f,isMapContext:w}=o,h=t.states[`vacuum.${n}`]?.attributes??{},v=h.region_icons??{},y=h.last_cleaned_rooms??[],x=h.mission_destination??null,_=new Date().toLocaleDateString("en-CA"),$=o.openDay===_,k=t.states[`sensor.${n}_clean_streak`],S=t.states[`sensor.${n}_completion_rate_30d`],C=k?parseInt(k.state,10):0,M=S?parseInt(S.state,10):NaN,D="",E=[];if(C>0&&E.push(`\u{1F525} ${C}-day streak`),isNaN(M)||E.push(`${M}% completion rate`),e.hasCleaningSpeedTrend){let H=t.states[`sensor.${n}_cleaning_performance`]?.attributes?.trend;H==="declining"?E.push('<span class="rpc-trend-declining">\u2193 Speed declining</span>'):H==="improving"&&E.push('<span class="rpc-trend-improving">\u2191 Speed improving</span>')}E.length&&(D=`<div class="rpc-history-summary">${E.map((F,H)=>H===0?F:`<span class="rpc-summary-sep">\xB7</span>${F}`).join("")}</div>`);let te=e.hasCoverageImage&&!f?`
    <div class="rpc-history-tabs">
      <button class="rpc-tab${p==="calendar"?" active":""}" data-history-tab="calendar">Calendar</button>
      <button class="rpc-tab${p==="coverage"?" active":""}" data-history-tab="coverage">Coverage</button>
    </div>`:"",q="";if(e.hasCoverageImage&&p==="coverage"){let H=t.states[`image.${n}_coverage_map`]?.attributes??{},L=H.x_min_mm,P=H.x_max_mm,z=H.y_min_mm,K=H.y_max_mm,b=H.entity_picture,W=H.last_mission_end,U=L!=null&&P!=null&&z!=null&&K!=null,de=U?d.map(O=>{let Q=Ce(O.x_mm,O.y_mm,L,P,z,K),se=m(Ct(O)),ee=St(O.source);return`<div class="rpc-hazard-pin rpc-pin-${O.source}" style="left:${Q.left};top:${Q.top}" title="${se}" aria-label="${se}">${ee}</div>`}).join(""):"",ue=!U&&b?'<div class="rpc-coverage-note">Spatial overlay unavailable \u2014 grid accumulating</div>':"",be=W?`<div class="rpc-coverage-updated">Updated ${J(W,t.language)}</div>`:"",me=d.some(O=>O.source==="stuck_events"),re=d.some(O=>O.source==="robot_learned"),he=d.some(O=>O.source==="keepout"),ae=[me?"<span>\u{1F4CD}</span> Stuck hotspot":"",re?"<span>\u{1F6A7}</span> Robot obstacle":"",he?"<span>\u{1F6AB}</span> Keep-out zone":""].filter(Boolean).join(" "),ne="";if(U&&e.hasAlignment){let O=H.rooms??{},Q=Object.values(O).map(B=>{if(!B.outline||B.outline.length<3)return"";let j=B.outline.map(([N,T])=>{let X=Fe(N,T,L,P,z,K);return`${X.x.toFixed(1)},${X.y.toFixed(1)}`}).join(" ");return`<polygon class="rpc-room-poly${u?.has(B.name)??!1?" rpc-room-poly--selected":""}"
          points="${j}" data-room-poly="${m(B.name)}" />`}).join(""),se=(()=>{let B=e.hasSmartZones?`select.${n}_smart_zone_select`:`select.${n}_zone_select`,j=t.states[B]?.attributes?.region_areas_m2;return j&&typeof j=="object"&&!Array.isArray(j)?j:{}})(),ee=Object.values(O).map(B=>{let j=Ce(B.x,B.y,L,P,z,K),V=ie[B.icon]??"",N=u?.has(B.name)??!1,T=se[B.name],X=typeof T=="number"&&!isNaN(T)?` / ${T.toFixed(1)} m\xB2`:"";return`<div class="rpc-room-label${N?" rpc-room-label--selected":""}"
          style="left:${j.left};top:${j.top}" data-room-label="${m(B.name)}">
          ${V?`${V} `:""}${m(B.name)}${m(X)}
        </div>`}).join("");ne=`
        <svg class="rpc-room-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
          ${Q}
        </svg>
        ${ee}
      `}q=b?`
      <div class="rpc-coverage-panel">
        <div class="rpc-coverage-image-wrap">
          <img class="rpc-coverage-img" src="${b}" alt="Coverage map" />
          ${ne}
          ${de}
        </div>
        ${ue}
        <div class="rpc-coverage-legend">
          <span style="color:var(--rpc-green)">\u25CF</span> High coverage
          <span style="color:var(--rpc-grey-mid,#9ca3af)">\u25CF</span> Rarely cleaned
          ${ae}
        </div>
        ${be}
      </div>`:'<div class="rpc-history-error">Coverage map unavailable</div>'}let Z="";o.loading&&!o.data?Z=We(Math.ceil(l/7)):o.error?Z=`<div class="rpc-history-error">${m(o.error)}</div>`:o.data&&(Z=Ie(o.data,l,i,t.language,e.hasDirtDensity),o.data.length<l&&(Z+=`<div class="rpc-history-partial">Showing ${o.data.length} of ${l} days \u2014 full history builds over time</div>`));let _e="";if(e.hasProblemZone){let F=t.states[`sensor.${n}_problem_zone`],H=t.states[`sensor.${n}_stuck_count_30d`];if(F&&F.state!=="unknown"&&F.state!=="unavailable"){let L=H?parseInt(H.state,10):0;L>0&&(_e=`<div class="rpc-problem-zone">\u26A0 ${m(F.state)} \u2014 stuck ${L}\xD7 in 30 days</div>`)}}let ce="";if(o.openDay){let H=new Date(o.openDay+"T00:00:00").toLocaleDateString(t.language,{weekday:"long",month:"long",day:"numeric",year:"numeric"}),L=o.dayMissions,P=o.openDaySummary,z="";if(L===null)z="";else if(P&&P.total===0)z='<div class="rpc-day-empty">No missions this day</div>';else if(L.length>0)z=L.map((b,W)=>{let U=b.result==="completed"||b.result==="stuck_and_resumed"?"success":b.result==="stuck"||b.result==="stuck_and_abandoned"||b.result==="blocked_timeout"?"failure":"caution",de=U==="success"?"\u2713":U==="failure"?"\u2717":"\u26A0",ue=U==="success"?"rpc-day-ok":U==="failure"?"rpc-day-err":"rpc-day-caution",be=new Date(b.started_at).toLocaleTimeString(t.language,{hour:"2-digit",minute:"2-digit",hour12:!1}),me=b.area_sqft!==null?at(b.area_sqft,c):"\u2014",re=b.zones?.map(j=>m(j)).join(" \xB7 ")??"",he=a.show_dirt_events&&b.dirt_events!=null&&b.dirt_events>0?`${b.dirt_events} dirt event${b.dirt_events!==1?"s":""}`:"",ae=[re,he].filter(Boolean).join(" \xB7 "),ne=b.initiator==="demand"?'<span class="rpc-initiator-badge">demand</span>':"",O="";if(b.wifi_signal&&b.wifi_signal.length>0){let j=b.wifi_signal.length===5,V=Oe(b.wifi_signal),N=je(V,Math.min(...V));if(j){let T=Le(b.wifi_signal);T!==null&&(O=`<div class="rpc-day-wifi" aria-label="Wi-Fi signal quality: ${T}% average during mission"><span aria-hidden="true">\u{1F4F6}</span>${N}<span>${T}% avg</span></div>`)}else{let T=Math.min(...V);O=`<div class="rpc-day-wifi" aria-label="Wi-Fi signal: minimum ${T}% during mission"><span aria-hidden="true">\u{1F4F6}</span>${N}<span>${T}% min</span></div>`}}let Q="";if($&&W===L.length-1&&y.length>0){let j=y.map(N=>{let T=v[N],X=T?ie[T]??"":"";return`<span class="rpc-trav-room">${X?X+"\xA0":""}${m(N)}</span>`}).join('<span class="rpc-trav-sep">\u2192</span>'),V=x?`<div class="rpc-mission-dest-popover">\u2192 Final: ${m(x)}</div>`:"";Q=`<div class="rpc-traversal-row">${j}</div>${V}`}let ee="";b.room_coverage&&Object.keys(b.room_coverage).length>0&&(ee=`<div class="rpc-room-coverage">${Object.entries(b.room_coverage).map(([V,N])=>{let T=Math.round(N*100);return`<span class="${T>=80?"rpc-cov-green":T>=60?"rpc-cov-amber":"rpc-cov-red"}">${m(V)} ${T}%</span>`}).join(" \xB7 ")}</div>`);let B="";return b.alignment_confidence!=null&&b.alignment_confidence<.85&&(B=`<div class="rpc-alignment-note">* Coverage estimates (alignment confidence: ${Math.round(b.alignment_confidence*100)}%)</div>`),`
          <div class="rpc-day-mission">
            <span class="rpc-day-icon ${ue}">${de}</span>
            <span class="rpc-day-time">${be}</span>
            <span class="rpc-day-dur">${b.duration_min} min</span>
            <span class="rpc-day-area">${me}</span>
            ${ne}
            ${ae?`<div class="rpc-day-zones">${ae}</div>`:""}
            ${O}
            ${Q}
            ${ee}
            ${B}
          </div>`}).join("");else if(P&&P.total>0){let b=P.area_sqft!==null?at(P.area_sqft,c):null;z=`
        <div class="rpc-day-aggregate">
          <div>${P.total} mission${P.total>1?"s":""} \xB7 ${m(P.result)}
            ${b?` \xB7 ${b} total`:""}</div>
          <div class="rpc-day-no-detail">Per-mission detail not available</div>
        </div>`}let K=P?.total??0;ce=`
      <div class="rpc-popover rpc-day-popover">
        <div class="rpc-popover-header">
          <span>${m(H)}</span>
          <button class="rpc-popover-close" data-close-day="true" aria-label="Close">\xD7</button>
        </div>
        <div class="rpc-popover-divider"></div>
        ${K>0&&L&&L.length>0?`<div class="rpc-day-count">${K} mission${K>1?"s":""}</div>`:""}
        ${z}
      </div>
    `}let pe="";if(a.show_lifetime!==!1){let F=t.states[`sensor.${n}_lifetime_missions`],H=t.states[`sensor.${n}_cleaning_analytics_30d`],L=F?parseInt(F.state,10):NaN,P=(()=>{let b=H?.attributes?.time_h;return typeof b=="number"?b:NaN})(),z=H?parseFloat(H.state):NaN;if(!isNaN(L)||!isNaN(P)||!isNaN(z)){let b=o.lifetimeExpanded?`
        <div class="rpc-lifetime-stats">
          <span class="rpc-lifetime-arrow">\u2192</span>
          ${isNaN(L)?"":`<span>${L.toLocaleString()} missions</span>`}
          ${isNaN(z)?"":`<span>${z.toLocaleString()} m\xB2</span>`}
          ${isNaN(P)?"":`<span>${P.toLocaleString()} h (30 d)</span>`}
        </div>`:"";pe=`
        <div class="rpc-lifetime-divider"></div>
        <button class="rpc-lifetime-toggle" data-lifetime-toggle aria-expanded="${o.lifetimeExpanded}">
          Stats ${o.lifetimeExpanded?"\u25B2":"\u25BC"}
        </button>
        ${b}
      `}}return`
    <div class="rpc-zone rpc-zone6">
      ${w?"":`<div class="rpc-zone-header">LAST ${l} DAYS</div>`}
      ${w?"":D}
      ${te}
      <div class="rpc-heatmap-wrap" data-heatmap>
        ${p==="coverage"&&e.hasCoverageImage?q:Z}
      </div>
      ${_e}
      ${ce}
      ${w?"":pe}
    </div>
  `}function st(t,a){return Math.min(100,Math.max(0,Math.round(t/a*100)))}function ot(t,a){return a==="battery"?t>20?"var(--rpc-green)":t>10?"var(--rpc-amber)":"var(--rpc-red)":a==="tank"?t>40?"var(--rpc-green)":t>20?"var(--rpc-amber)":"var(--rpc-red)":t>50?"var(--rpc-green)":t>10?"var(--rpc-amber)":"var(--rpc-red)"}function Rt(t,a){let e=a/90;if(!e)return"";let r=t/e;return r>1.2?"\u2191":r<.8?"\u2193":"\u2192"}function nt(t){let a=parseInt(t,10);return!isNaN(a)&&a>=0?`~${a} use${a!==1?"s":""} remaining`:t==="Empty"?"Bag full \u2014 replace soon":t==="Full"?"Bag has capacity":m(t)}function it(t){return t>=80?"var(--rpc-green)":t>=60?"var(--rpc-amber)":"var(--rpc-red)"}function Tt(t){return t>=80?"GOOD":t>=60?"FAIR":"NEEDS ATTENTION"}function Et(t,a,e,r){if(!a.hasRobotHealthScore)return"";let o=t.states[`sensor.${e}_robot_health_score`];if(!o)return"";if(o.state==="unknown"||o.state==="unavailable")return`
      <div class="rpc-health-score rpc-health-score--calibrating">
        <span class="rpc-health-score-label">ROBOT HEALTH</span>
        <span class="rpc-health-score-calibrating">Calibrating\u2026 (needs more mission history)</span>
      </div>
      <button class="rpc-health-details-toggle" data-health-details-toggle aria-expanded="${r}">
        ${r?"Hide details \u25B2":"Show details \u25BC"}
      </button>
    `;let n=Math.round(parseFloat(o.state));if(isNaN(n))return"";let l=it(n),i=Tt(n);return`
    <div class="rpc-health-score" aria-label="Robot health ${n} out of 100, ${i}">
      <span class="rpc-health-score-label">ROBOT HEALTH</span>
      <span class="rpc-health-score-value" style="color:${l}">${n}</span>
      <span class="rpc-health-score-band" style="color:${l}">\u25CF ${i}</span>
    </div>
    <button class="rpc-health-details-toggle" data-health-details-toggle aria-expanded="${r}">
      ${r?"Hide details \u25B2":"Show details \u25BC"}
    </button>
  `}function Ht(t,a){let e=t.states[`sensor.${a}_consecutive_mission_anomalies`];if(!e)return"";let r=Number(e.state);return!Number.isFinite(r)||r<3?"":`
    <div class="rpc-anomaly-banner" role="alert">
      \u26A0 Last ${r} missions were anomalous \u2014 check brushes and filter
    </div>
  `}function Mt(t,a,e,r){if(!a.hasNavStats)return"";let o=d=>{let u=t.states[`sensor.${e}_${d}`];if(!u||u.state==="unknown"||u.state==="unavailable")return null;let f=Number(u.state);return Number.isFinite(f)?f:null},s=o("nav_quality"),n=o("nav_panics"),l=o("nav_landmark_quality"),i=o("nav_good_landmarks");if(s===null&&n===null&&l===null&&i===null)return"";let c=s!==null?`<span class="rpc-nav-score-value" style="color:${it(s)}">${Math.round(s)}</span><span class="rpc-nav-score-max">/100</span>`:'<span class="rpc-nav-score-value rpc-nav-score--na">\u2014</span>',p=[];return n!==null&&p.push(`<div class="rpc-nav-factor" title="How often navigation failed and the robot had to recover">
        <span class="rpc-nav-factor-label">Panic events</span>
        <span class="rpc-nav-factor-value">${n}</span>
      </div>`),l!==null&&p.push(`<div class="rpc-nav-factor" title="Match-tracking quality of visual landmarks (higher is better)">
        <span class="rpc-nav-factor-label">Landmark quality</span>
        <span class="rpc-nav-factor-value">${l}</span>
      </div>`),i!==null&&p.push(`<div class="rpc-nav-factor" title="Number of reliable visual landmarks the robot is tracking">
        <span class="rpc-nav-factor-label">Good landmarks</span>
        <span class="rpc-nav-factor-value">${i}</span>
      </div>`),`
    <div class="rpc-nav-health">
      <div class="rpc-nav-header">
        <span class="rpc-nav-label">NAVIGATION</span>
        <span class="rpc-nav-score">${c}</span>
        <button class="rpc-nav-toggle" data-nav-details-toggle aria-expanded="${r}">
          ${r?"Hide \u25B2":"Details \u25BC"}
        </button>
      </div>
      ${r&&p.length>0?`<div class="rpc-nav-factors">${p.join("")}</div>`:""}
    </div>
  `}function At(t,a,e,r){if(!a.hasMaintenanceCalendar)return"";let o=[{key:"wheel",label:"Wheels",entityId:`sensor.${e}_wheel_last_cleaned`,service:"roomba_plus.reset_wheel_cleaning"},{key:"contact",label:"Contacts",entityId:`sensor.${e}_contact_last_cleaned`,service:"roomba_plus.reset_contact_cleaning"},{key:"bin",label:"Bin",entityId:`sensor.${e}_bin_last_cleaned`,service:"roomba_plus.reset_bin_cleaning"}].filter(n=>!!t.states[n.entityId]);return o.length===0?"":`
    <div class="rpc-maint-divider"></div>
    <div class="rpc-maint-header">Other maintenance</div>
    ${o.map(n=>{let l=t.states[n.entityId],i=r.openMaintPopover===n.key,p=l.state!=="unavailable"&&l.state!=="unknown"?`Cleaned ${J(l.state,t.language)}`:"Never recorded";return`
      <div class="rpc-maint-row" data-maint="${n.key}" role="button" aria-expanded="${i}" tabindex="0"
           aria-label="${n.label} \u2014 ${p}">
        <span class="rpc-maint-label">${n.label}</span>
        <span class="rpc-maint-val">${p}</span>
      </div>
      ${i?`
        <div class="rpc-popover">
          <div class="rpc-popover-header">
            <span>${n.label}</span>
            <button class="rpc-popover-close" data-close-maint="${n.key}" aria-label="Close">\xD7</button>
          </div>
          <div class="rpc-popover-divider"></div>
          <div class="rpc-popover-sub">Reset via Developer Tools \u2192 Services:</div>
          <div class="rpc-maint-service">${n.service}</div>
        </div>
      `:""}
    `}).join("")}
  `}function lt(t,a,e,r,o){if(a.show_health===!1)return"";let s=r,n=[];t.states[`sensor.${s}_filter_remaining_hours`]&&n.push({key:"filter",label:"Filter",sensorId:`sensor.${s}_filter_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:e.hasWearRate?`sensor.${s}_filter_wear_rate`:void 0,resetService:"reset_filter",lastReplacedId:`sensor.${s}_filter_last_replaced`}),e.hasBrush&&t.states[`sensor.${s}_brush_remaining_hours`]&&n.push({key:"brush",label:"Brush",sensorId:`sensor.${s}_brush_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:e.hasWearRate?`sensor.${s}_brush_wear_rate`:void 0,resetService:"reset_brush",lastReplacedId:`sensor.${s}_brush_last_replaced`}),e.hasPad&&t.states[`sensor.${s}_pad_days_until_due`]&&n.push({key:"pad",label:"Pad",sensorId:`sensor.${s}_pad_days_until_due`,thresholdAttr:"threshold_days",type:"consumable",unit:"d",wearSensorId:e.hasWearRate?`sensor.${s}_pad_wear_rate`:void 0,resetService:"reset_pad",lastReplacedId:`sensor.${s}_pad_last_replaced`}),e.hasWater&&t.states[`sensor.${s}_mop_tank_level`]&&n.push({key:"tank",label:"Tank",sensorId:`sensor.${s}_mop_tank_level`,thresholdAttr:null,type:"tank"});let l=t.states[`sensor.${s}_battery`]?`sensor.${s}_battery`:null,i=l?void 0:t.states[`vacuum.${s}`]?.attributes?.battery_level;(l||i!==void 0)&&n.push({key:"battery",label:"Battery",sensorId:l??"",thresholdAttr:null,type:"battery",rawPct:i}),e.hasCleanBase&&t.states[`sensor.${s}_clean_base_status`]&&n.push({key:"cleanbase",label:"Clean Base",sensorId:`sensor.${s}_clean_base_status`,thresholdAttr:null,type:"cleanbase"});let c=Ht(t,s),p=Mt(t,e,s,o.navDetailsExpanded);if(n.length===0&&!e.hasRobotHealthScore&&!e.hasMaintenanceCalendar&&!c&&!p&&!e.hasBatteryRetention&&!e.hasCoveragePct)return"";let d=n.map(y=>Dt(y,t,s,o)).join(""),u="";if(e.hasBatteryRetention){let y=t.states[`sensor.${s}_battery_capacity_retention`];if(y&&y.state!=="unavailable"&&y.state!=="unknown"){let x=Math.round(parseFloat(y.state));if(!isNaN(x)){let _=x>85?"var(--rpc-green)":x>70?"var(--rpc-amber)":"var(--rpc-red)",$=t.states[`sensor.${s}_battery_cycles`],k=$?parseInt($.state,10):NaN,S=isNaN(k)?"":`${k} charge cycle${k!==1?"s":""}`,C="";if(e.hasBatteryEol){let q=t.states[`sensor.${s}_estimated_battery_eol`];if(q&&q.state!=="unavailable"&&q.state!=="unknown"){let Z=parseInt(q.state,10);isNaN(Z)||(C=Z>0?`<div class="rpc-retention-eol">Battery life: ~${Z} days remaining</div>`:'<div class="rpc-retention-eol rpc-retention-eol--warn">Consider replacing \u2014 battery at end of life</div>')}}let M=o.openPopover==="retention",D=o.resetting==="retention",te=M?`
          <div class="rpc-popover">
            <div class="rpc-popover-header">
              <span>Battery Health</span>
              <button class="rpc-popover-close" data-close="retention" aria-label="Close">\xD7</button>
            </div>
            <div class="rpc-popover-divider"></div>
            <div class="rpc-popover-body">
              <div>${x}% of original capacity</div>
              ${S?`<div class="rpc-popover-sub">${S}</div>`:""}
              ${C}
            </div>
            <button class="rpc-btn rpc-btn-secondary${D?" rpc-btn-loading":""}"
                    data-reset="retention" data-service="reset_battery"
                    ${D?"disabled":""}>
              ${D?'<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':"Mark as replaced"}
            </button>
            ${o.resetError==="retention"?'<div class="rpc-send-error">Reset failed \u2014 try again</div>':""}
          </div>`:"";u=`
          <div class="rpc-bar-row" data-bar="retention" role="button" aria-expanded="${M}" tabindex="0"
               aria-label="Bat. Health \u2014 ${x}%">
            <span class="rpc-bar-label">Bat. Health</span>
            <div class="rpc-bar-track"><div class="rpc-bar-fill" style="width:${x}%;background:${_}"></div></div>
            <span class="rpc-bar-pct" style="color:${_}">${x}%</span>
            <span class="rpc-bar-hours"></span>
          </div>
          ${te}`}}}let f="";if(e.hasCoveragePct){let y=t.states[`sensor.${s}_recent_coverage_pct`];if(y&&y.state!=="unavailable"&&y.state!=="unknown"){let x=t.states[`sensor.${s}_missions_last_30d`],_=x?parseInt(x.state,10):NaN;if(isNaN(_)||_<10)f=`
          <div class="rpc-bar-row rpc-bar-row--static">
            <span class="rpc-bar-label">Coverage</span>
            <span class="rpc-coverage-building">Building history\u2026</span>
          </div>`;else{let $=Math.min(100,Math.round(parseFloat(y.state)));if(!isNaN($)){let k=$>=85?"var(--rpc-green)":$>=65?"var(--rpc-amber)":"var(--rpc-red)",S=o.openPopover==="coverage",C=isNaN(_)?"":`Based on ${_} mission${_!==1?"s":""} in the last 30 days.`,M=S?`
            <div class="rpc-popover">
              <div class="rpc-popover-header">
                <span>Floor Coverage</span>
                <button class="rpc-popover-close" data-close="coverage" aria-label="Close">\xD7</button>
              </div>
              <div class="rpc-popover-divider"></div>
              <div class="rpc-popover-body">
                <div>${$}% of floor area covered on the last mission.</div>
                ${C?`<div class="rpc-popover-sub">${C}</div>`:""}
                <div class="rpc-popover-sub">Low coverage may indicate obstacles, map drift, or a missed room.</div>
              </div>
            </div>`:"";f=`
            <div class="rpc-bar-row" data-bar="coverage" role="button" aria-expanded="${S}" tabindex="0"
                 aria-label="Coverage ${$}% last mission">
              <span class="rpc-bar-label">Coverage</span>
              <div class="rpc-bar-track"><div class="rpc-bar-fill" style="width:${$}%;background:${k}"></div></div>
              <span class="rpc-bar-pct" style="color:${k}">${$}%</span>
              <span class="rpc-bar-hours">last mission</span>
            </div>
            ${M}`}}}}let w=u||f?`<div class="rpc-health-battery-sep"></div>${u}${f}`:"",h="";if(e.hasEnergyConsumption){let y=t.states[`sensor.${s}_total_energy_consumed`];if(y&&y.state!=="unavailable"&&y.state!=="unknown"){let x=parseFloat(y.state);if(!isNaN(x)){let _=t.states[`sensor.${s}_battery_cycles`],$=_?parseInt(_.state,10):NaN,k=o.openPopover==="energy",S=k?`
          <div class="rpc-popover">
            <div class="rpc-popover-header">
              <span>Energy</span>
              <button class="rpc-popover-close" data-close="energy" aria-label="Close">\xD7</button>
            </div>
            <div class="rpc-popover-divider"></div>
            <div class="rpc-popover-body">
              <div>~${x.toFixed(1)} kWh used${isNaN($)?"":` over ${$} charge cycles`}</div>
              <div class="rpc-popover-sub">Estimated from battery capacity and cycle count.</div>
              <div class="rpc-popover-sub">Connect to the HA Energy dashboard for home-wide monitoring.</div>
            </div>
          </div>`:"";h=`
          <div class="rpc-bar-row" data-bar="energy" role="button" aria-expanded="${k}" tabindex="0"
               aria-label="Lifetime energy ~${x.toFixed(1)} kWh">
            <span class="rpc-bar-label">Energy</span>
            <span class="rpc-energy-val">~${x.toFixed(1)} kWh lifetime</span>
          </div>
          ${S}`}}}let v="";if(e.isMop){let y=t.states[`sensor.${s}_mop_pad`],x=e.hasMopBehavior?t.states[`sensor.${s}_mop_behavior`]:null,_=[];y&&y.state!=="unknown"&&y.state!=="unavailable"&&_.push(m(y.state)),x&&x.state!=="unknown"&&x.state!=="unavailable"&&_.push(`${m(x.state)} intensity`),_.length&&(v=`
        <div class="rpc-health-divider"></div>
        <div class="rpc-mop-config">${_.join(" \xB7 ")}</div>
      `)}return`
    <div class="rpc-zone rpc-zone3">
      <div class="rpc-zone-header">HEALTH</div>
      ${c}
      ${Et(t,e,s,o.healthDetailsExpanded)}
      ${e.hasRobotHealthScore&&!o.healthDetailsExpanded?"":`
        ${d}
        ${w}
        ${h}
        ${v}
      `}
      ${At(t,e,s,o)}
      ${p}
    </div>
  `}function Dt(t,a,e,r){let o=r.openPopover===t.key;if(t.type==="cleanbase"){let u=a.states[t.sensorId];return u?`
      <div class="rpc-bar-row" data-bar="${t.key}" role="button" aria-expanded="${o}" tabindex="0"
           aria-label="${t.label}">
        <span class="rpc-bar-label">${t.label}</span>
        <span class="rpc-bar-cleanbase-state">${nt(u.state)}</span>
      </div>
      ${o?Pt(t.label,u.state):""}
    `:""}let s=0,n="",l="",i=null;if(t.rawPct!==void 0)s=Math.min(100,Math.max(0,t.rawPct)),n=`${Math.round(s)}%`;else{let u=a.states[t.sensorId];if(!u)return"";let f=parseFloat(u.state);if(isNaN(f))return"";if(t.type==="tank"||t.type==="battery")s=Math.min(100,Math.max(0,f)),n=`${Math.round(s)}%`;else{if(i=t.thresholdAttr?u.attributes[t.thresholdAttr]:null,!i)return"";s=st(f,i),n=`${s}%`,l=`${Math.round(f)}h`}}let c=ot(s,t.type),p="";if(t.wearSensorId&&i){let u=a.states[t.wearSensorId];u&&u.state!=="unknown"&&u.state!=="unavailable"&&(p=Rt(parseFloat(u.state),i))}let d=t.rawPct!==void 0?{state:String(Math.round(t.rawPct)),attributes:{}}:a.states[t.sensorId];return`
    <div class="rpc-bar-row" data-bar="${t.key}" role="button" aria-expanded="${o}" tabindex="0"
         aria-label="${t.label} \u2014 ${n}">
      <span class="rpc-bar-label">${t.label}</span>
      <div class="rpc-bar-track">
        <div class="rpc-bar-fill" style="width:${s}%;background:${c}"></div>
      </div>
      <span class="rpc-bar-pct" style="color:${c}">${n}</span>
      ${l?`<span class="rpc-bar-hours">${l}</span>`:""}
      ${p?`<span class="rpc-bar-arrow" style="color:${c}">${p}</span>`:""}
    </div>
    ${o&&d?zt(t,d,i,a,r):""}
  `}function zt(t,a,e,r,o){let s=parseFloat(a.state),n=e?st(s,e):Math.min(100,Math.max(0,s)),l=ot(n,t.type),i=o.resetting===t.key,c=t.lastReplacedId?r.states[t.lastReplacedId]:null,p="";c&&c.state!=="unavailable"&&c.state!=="unknown"&&(p=`
      <div class="rpc-popover-row">
        <span>Last replaced</span>
        <span>${new Date(c.state).toLocaleDateString(r.language)} (${J(c.state,r.language)})</span>
      </div>`);let d="";if(t.wearSensorId&&!o.legendShown){let f=r.states[t.wearSensorId];f&&f.state!=="unknown"&&f.state!=="unavailable"&&(d=`
        <div class="rpc-wear-legend" data-wear-legend>
          <span class="rpc-wear-legend-title">Wear trend</span>
          <span>\u2191 wearing faster than normal</span>
          <span>\u2192 wearing at normal rate</span>
          <span>\u2193 wearing slower than normal</span>
        </div>`)}return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${m(t.label)}</span>
        <button class="rpc-popover-close" data-close="${t.key}" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      ${p}
      ${e?`<div class="rpc-popover-row"><span>Threshold</span><span>${e} ${t.unit??"h"}</span></div>`:""}
      ${e?`<div class="rpc-popover-row"><span>Remaining</span><span>${Math.round(s)} ${t.unit??"h"} (${n}%)</span></div>`:""}
      <div class="rpc-popover-bar-track">
        <div class="rpc-popover-bar-fill" style="width:${n}%;background:${l}"></div>
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
  `}function Pt(t,a){return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${m(t)}</span>
        <button class="rpc-popover-close" data-close="cleanbase" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      <div class="rpc-popover-row"><span>Status</span><span>${nt(a)}</span></div>
      <div class="rpc-popover-row"><span>Function</span><span>Auto-empties bin after missions</span></div>
    </div>
  `}function ct(t,a){if(!t||t==="unavailable"||t==="unknown")return"No schedule set";try{let e=new Date(t);return e.toLocaleDateString(a,{weekday:"short"})+" "+e.toLocaleTimeString(a,{hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return m(t)}}function Nt(t,a){if(!t||t==="unavailable"||t==="unknown")return"";try{let e=new Date(t);if(isNaN(e.getTime()))return"";let r=e.toLocaleDateString(a,{weekday:"short"}),o=e.toLocaleTimeString(a,{hour:"2-digit",minute:"2-digit",hour12:!1});return`${r} ~${o}`}catch{return""}}function pt(t,a,e,r,o){if(a.show_schedule===!1)return"";let s=r,n=t.states[`sensor.${s}_next_clean`],l=t.states[`binary_sensor.${s}_schedule_hold_active`],i=t.states[`sensor.${s}_presence_clean_opportunities_7d`],c=t.states[`sensor.${s}_presence_clean_utilisation_7d`],p=t.states[`sensor.${s}_next_likely_clean_window`],d=!!i&&!!c&&i.state!=="unknown"&&i.state!=="unavailable"&&c.state!=="unknown"&&c.state!=="unavailable",u=!!p&&p.state!=="unknown"&&p.state!=="unavailable";if(!n&&!l&&!d&&!u&&!e.hasOptimalWindow)return"";let f="";if(l){let _=l.state==="on",k=l.attributes.source==="presence_manager",S="rpc-badge-green",C="Schedule active",M="";_&&(k?(S="rpc-badge-blue",C="Away hold",M="\u{1F3C3}"):(S="rpc-badge-amber",C="Hold active",M="\u{1F512}")),f=`
      <button class="rpc-hold-badge ${S}"
              data-hold-action="${k?"tooltip":"toggle"}"
              aria-label="${m(C)}">
        ${o.holdToggling?'<svg class="rpc-spinner rpc-spinner-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':`${M} ${C}`}
      </button>
      ${o.holdTooltipVisible?`
        <div class="rpc-hold-tooltip" role="status">
          Schedule managed by presence automation \u2014 controlled automatically
        </div>`:""}
    `}let w="";if(u){let _=Nt(p.state,t.language);_&&(w=`
        <div class="rpc-next-clean rpc-next-clean--likely">
          <span class="rpc-schedule-label">Next likely window</span>
          <span class="rpc-schedule-time rpc-schedule-time--approx">${_}</span>
        </div>
      `)}let h="";if(e.hasOptimalWindow){let _=t.states[`sensor.${s}_optimal_clean_window`];if(_&&_.state!=="unavailable"&&_.state!=="unknown"){let $=ct(_.state,t.language);$&&$!=="No schedule set"&&(h=`
          <div class="rpc-next-clean rpc-next-clean--optimal">
            <span class="rpc-schedule-label">Optimal window</span>
            <span class="rpc-schedule-time">
              ${$}
              <span class="rpc-optimal-star" title="Analytically derived from cleaning history">\u2605</span>
            </span>
          </div>`)}}let v="",y=a.presence_entities??[];if(y.length>0){let _=y.map($=>{let k=t.states[$];if(!k)return"";let S=k.state==="home",C=k.attributes.friendly_name??$,M=m(C.split(" ")[0]);return`<span class="rpc-presence-dot">
        <span class="rpc-dot ${S?"rpc-dot-amber":"rpc-dot-green"}" aria-hidden="true"></span>
        ${M}
        <span class="rpc-presence-label">${S?"home":"away"}</span>
      </span>`}).join("");_&&(v=`<div class="rpc-presence-row">${_}</div>`)}let x="";if(d){let _=parseInt(i.state,10),$=parseInt(c.state,10);if(!isNaN(_)&&!isNaN($)){let k=c.attributes.cleans_7d,S=k??Math.round(_*$/100),C=`${_} opportunit${_!==1?"ies":"y"} this week`;x=`
        <div class="rpc-presence-analytics" aria-label="Presence cleaning analytics">
          ${`${S} clean${S!==1?"s":""}`} \xB7 ${C}
        </div>
      `}}return`
    <div class="rpc-zone rpc-zone4">
      <div class="rpc-zone-header">SCHEDULE &amp; PRESENCE</div>
      <div class="rpc-schedule-row">
        <div class="rpc-schedule-times">
          ${n?`
            <div class="rpc-next-clean">
              <span class="rpc-schedule-label">Next scheduled</span>
              <span class="rpc-schedule-time">${ct(n.state,t.language)}</span>
            </div>`:""}
          ${w}
          ${h}
        </div>
        ${f}
      </div>
      ${v}
      ${x}
    </div>
  `}function It(t,a){let e=`button.${a}_fav_`;return Object.keys(t.states).filter(r=>r.startsWith(e)).sort()}function Lt(t,a,e){let r=t.states[a]?.attributes?.friendly_name?.trim();if(r){let s=t.states[`vacuum.${e}`]?.attributes?.friendly_name?.trim();return s&&r.startsWith(s+" ")?r.slice(s.length+1):r}return a.replace(`button.${e}_fav_`,"").split("_").map(s=>s&&s[0].toUpperCase()+s.slice(1)).join(" ")}function dt(t,a,e){let r=It(t,e);return r.length===0?"":`
    <div class="rpc-settings-divider"></div>
    <div class="rpc-fav-section">
      <div class="rpc-fav-label">Favourites</div>
      <div class="rpc-fav-row">${r.map(s=>{let n=m(Lt(t,s,e));return`<button class="rpc-fav-btn" data-fav-entity="${m(s)}" aria-label="${n}">\u2605 ${n}</button>`}).join("")}</div>
    </div>
  `}function ut(t,a){let{hass:e,config:r,caps:o,robotName:s,isMetric:n}=a;switch(t){case"map":return Ee(e,r,o,s,{data:a.missionData,loading:a.historyLoading,error:a.historyError,openDay:a.openDay,dayMissions:a.dayMissions,openDaySummary:a.openDaySummary,lifetimeExpanded:a.lifetimeExpanded,historyTab:"coverage",hazards:a.hazards,mapSelectedRooms:a.selectedRooms,suppressSubTabToggle:!0,isMapContext:!0},n);case"history":return Ee(e,r,o,s,{data:a.missionData,loading:a.historyLoading,error:a.historyError,openDay:a.openDay,dayMissions:a.dayMissions,openDaySummary:a.openDaySummary,lifetimeExpanded:a.lifetimeExpanded,historyTab:r.mode==="companion"?a.historyTab:"calendar",hazards:a.hazards,suppressSubTabToggle:r.mode!=="companion"},n);case"health":return`
          ${a.alertZoneHtml}
          ${lt(e,r,o,s,{openPopover:a.openPopover,resetting:a.resetting,resetError:a.resetError,legendShown:a.legendShown,healthDetailsExpanded:a.healthDetailsExpanded,openMaintPopover:a.openMaintPopover,navDetailsExpanded:a.navDetailsExpanded})}
        `;case"settings":return`
          ${pt(e,r,o,s,{holdTooltipVisible:a.holdTooltipVisible,holdToggling:a.holdToggling})}
          <div class="rpc-settings-divider"></div>
          ${we(e,r,s,a.settingsPanelOpen)}
          ${r.mode!=="companion"?ye({hass:e,config:r,caps:o,robotName:s,selectedRooms:a.selectedRooms,passes:a.passes,isSending:a.isSendingClean,sendError:a.sendError,settingsPanelOpen:a.settingsPanelOpen,includeSettingsPanel:!1}):""}
          ${a.maintenanceLinksHtml}
          ${dt(e,r,s)}
        `;default:return""}}function mt(t){return Ot.has(t)}var Ot=new Set(["room","tab","household-back","room-overlay","close","health-details-toggle","nav-details-toggle","maint","close-maint","close-day","settings-toggle","lifetime-toggle","history-tab","bar","heatmap-cell"]);function ht(t,a,e={}){switch(t){case"room":{let r=e.room;return a.selectedRooms.has(r)?a.selectedRooms.delete(r):a.selectedRooms.add(r),{selectedRooms:a.selectedRooms}}case"room-overlay":{let r=e.room;return r?(a.selectedRooms.has(r)?a.selectedRooms.delete(r):a.selectedRooms.add(r),{selectedRooms:a.selectedRooms}):{}}case"tab":{let r=e.tab??null;return r===a.activeTab?{}:{activeTab:r}}case"household-back":return{viewMode:"robot"};case"close":return{openPopover:null};case"health-details-toggle":return{healthDetailsExpanded:!a.healthDetailsExpanded};case"nav-details-toggle":return{navDetailsExpanded:!a.navDetailsExpanded};case"maint":{let r=e.maint;return{openMaintPopover:a.openMaintPopover===r?null:r}}case"close-maint":return{openMaintPopover:null};case"close-day":return{openDay:null,dayMissions:null,openDaySummary:null};case"settings-toggle":return{settingsPanelOpen:!a.settingsPanelOpen};case"lifetime-toggle":return{lifetimeExpanded:!a.lifetimeExpanded};case"history-tab":return{historyTab:e.historyTab,openDay:null,dayMissions:null,openDaySummary:null};case"bar":{let r=e.bar;return{openPopover:a.openPopover===r?null:r,resetError:null}}case"heatmap-cell":{let r=e.date;return a.openDay===r?{openDay:null,dayMissions:null,openDaySummary:null}:{openDay:r,openDaySummary:e.daySummaryForDate??null,dayMissions:e.dayMissionsForDate??null}}}}var Ft={start:["vacuum","start"],pause:["vacuum","pause"],resume:["vacuum","start"],return_home:["vacuum","return_to_base"],locate:["vacuum","locate"],stop:["vacuum","stop"],retry:["vacuum","start"]};function gt(t){if(t==="clean-selected")return{kind:"clean-selected"};if(t==="repeat-last")return{kind:"repeat-last"};if(t==="toggle-room-picker")return{kind:"toggle-room-picker"};let a=Ft[t];if(!a)return{kind:"noop"};let[e,r]=a;return{kind:"vacuum",domain:e,service:r,action:t,pulse:t==="locate"}}var vt=`
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
  /* A1 \u2014 navigation health detail */
  .rpc-nav-health { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--divider-color, rgba(0,0,0,.08)); }
  .rpc-nav-header { display: flex; align-items: center; gap: 8px; }
  .rpc-nav-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em; color: var(--secondary-text-color); }
  .rpc-nav-score { display: flex; align-items: baseline; gap: 1px; }
  .rpc-nav-score-value { font-size: 1.1rem; font-weight: 700; line-height: 1; }
  .rpc-nav-score-max { font-size: 0.7rem; color: var(--secondary-text-color); }
  .rpc-nav-score--na { color: var(--secondary-text-color); }
  .rpc-nav-toggle {
    margin-left: auto; font-size: 0.72rem; background: none; border: none;
    color: var(--primary-color); cursor: pointer; padding: 2px 4px;
  }
  .rpc-nav-factors { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
  .rpc-nav-factor { display: flex; justify-content: space-between; font-size: 0.8rem; }
  .rpc-nav-factor-label { color: var(--secondary-text-color); }
  .rpc-nav-factor-value { font-weight: 600; font-variant-numeric: tabular-nums; }
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
  /* A3 \u2014 Favourites row */
  .rpc-fav-section { margin-top: 8px; }
  .rpc-fav-label {
    font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.04em; color: var(--secondary-text-color); margin: 6px 0 6px;
  }
  .rpc-fav-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .rpc-fav-btn {
    font-size: 0.8rem; padding: 6px 12px; border-radius: 16px;
    border: 1px solid var(--divider-color, rgba(0,0,0,.12));
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color); cursor: pointer;
  }
  .rpc-fav-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }
  .rpc-fav-btn:active { transform: scale(0.97); }
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
  /* v2.1.0 A4 \u2014 current-room line */
  .rpc-current-room  { font-size: 0.80rem; color: var(--secondary-text-color); margin-top: 4px; padding-left: 2px; }
  /* v2.1.0 A1 \u2014 connectivity indicator (only rendered when degraded) */
  .rpc-connectivity-degraded {
    font-size: 0.68rem; font-weight: 600; color: var(--rpc-amber);
    border: 1px solid var(--rpc-amber); border-radius: 4px;
    padding: 1px 5px; margin-left: 6px; white-space: nowrap;
  }
  /* v2.1.0 A2 \u2014 firmware badge (24h after a firmware change) */
  .rpc-firmware-badge {
    font-size: 0.68rem; font-weight: 600;
    color: var(--rpc-green, #4caf50);
    border: 1px solid var(--rpc-green, #4caf50); border-radius: 4px;
    padding: 1px 5px; margin-left: 6px; white-space: nowrap;
  }

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
`,He=class extends HTMLElement{constructor(){super();this.robotName="";this.activeRobot="";this.missionEventUnsub=null;this.missionEventSubscribing=!1;this.activeTab=null;this.roomPickerOpen=!1;this.viewMode="robot";this.selectedRooms=new Set;this.passes="Auto";this.passSettingInFlight=!1;this.isSendingClean=!1;this.sendError=null;this.settingsPanelOpen=!1;this.loadingAction=null;this.locateTimer=null;this.actionResetTimer=null;this.cleanTimeoutTimer=null;this.openPopover=null;this.resetting=null;this.resetError=null;this.legendShown=!1;this.healthDetailsExpanded=!1;this.navDetailsExpanded=!1;this.openMaintPopover=null;this.holdTooltipVisible=!1;this.holdToggling=!1;this.holdTooltipTimer=null;this.alertsVisible=!1;this.lastAlertHtml="";this.alertCollapseTimer=null;this.missionData=null;this.firstRecord=null;this.firstSummary=null;this.historyLoading=!1;this.historyError=null;this.openDay=null;this.dayMissions=null;this.openDaySummary=null;this.lifetimeExpanded=!1;this.hazards=[];this.historyTab="calendar";this.householdData=null;this.apiClient=null;this.prevVacuumState="";this.prevMissionActive="";this.handleOutsideClick=e=>{if(!e.composedPath().includes(this)){let o=!1;this.openPopover!==null&&(this.openPopover=null,o=!0),this.openMaintPopover!==null&&(this.openMaintPopover=null,o=!0),this.openDay!==null&&(this.openDay=null,this.dayMissions=null,this.openDaySummary=null,o=!0),o&&this.render()}};this.handleDelegatedClick=e=>{let r=e.target,o=Xe(r);o&&(e.stopPropagation(),this.dispatchClick(o.key,o.el))};this.handleDelegatedChange=e=>{let r=e.target?.closest("[data-robot-select]");if(!r)return;e.stopPropagation();let o=r.value;o==="__household__"?(this.viewMode="household",this.render()):(this.viewMode="robot",this.switchRobot(o))};this.handleDelegatedKeydown=e=>{let r=e;if(r.key!=="Enter"&&r.key!==" ")return;let o=et(e.target);o&&(e.preventDefault(),e.stopPropagation(),this.dispatchClick(o.key,o.el))};this.root=this.attachShadow({mode:"open"})}connectedCallback(){document.addEventListener("click",this.handleOutsideClick),this.root.addEventListener("click",this.handleDelegatedClick),this.root.addEventListener("change",this.handleDelegatedChange),this.root.addEventListener("keydown",this.handleDelegatedKeydown)}disconnectedCallback(){document.removeEventListener("click",this.handleOutsideClick),this.root.removeEventListener("click",this.handleDelegatedClick),this.root.removeEventListener("change",this.handleDelegatedChange),this.root.removeEventListener("keydown",this.handleDelegatedKeydown),this.missionEventUnsub&&(this.missionEventUnsub().catch(()=>{}),this.missionEventUnsub=null),this.missionEventSubscribing=!1,this.clearAllTimers()}clearAllTimers(){[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(e=>{e!==null&&clearTimeout(e)}),this.locateTimer=this.actionResetTimer=this.cleanTimeoutTimer=null,this.holdTooltipTimer=this.alertCollapseTimer=null}setConfig(e){let r=e.entities&&e.entities.length>0?e.entities:[e.entity];if(!r[0])throw new Error("roomba-plus-card: entity is required");let o=this.activeRobot,s=r.includes(o)?o:r[0],n=s!==o;this.config=e,this.activeRobot=s,this.robotName=s.replace("vacuum.",""),n&&this.resetRobotState(),this.root.innerHTML=`<style>${vt}</style><div class="rpc-card" style="padding:16px;color:var(--secondary-text-color,#9ca3af);font-size:.85rem">Loading\u2026</div>`}set hass(e){let r=this.relevantEntityIds(),o=!this._hass||r.some(c=>e.states[c]?.state!==this._hass.states[c]?.state||e.states[c]?.last_changed!==this._hass.states[c]?.last_changed),s=this._hass;this._hass=e;let n=e.states[`select.${this.robotName}_cleaning_passes`];n&&!this.isSendingClean&&!this.passSettingInFlight&&(this.passes=Ae[n.state]??"Auto");let l=`binary_sensor.${this.robotName}_mission_active`,i=e.states[l]?.state??"";if(i)this.prevMissionActive==="on"&&i==="off"&&this.loadHistory(),this.prevMissionActive=i;else{let c=e.states[this.activeRobot]?.state??"";this.prevVacuumState==="cleaning"&&c==="docked"&&this.loadHistory(),this.prevVacuumState=c}this.apiClient===null?this.config.show_history!==!1&&(this.apiClient=new ve(e,this.config,this.activeRobot),this.loadHistory()):this.apiClient.updateHass(e),this.maybeSubscribeMissionEvents(),(!s||o)&&this.render()}relevantEntityIds(){let e=this.robotName;return[this.activeRobot,`sensor.${e}_last_error_code`,`sensor.${e}_last_error_zone`,`sensor.${e}_phase`,`binary_sensor.${e}_mission_active`,`binary_sensor.${e}_maintenance_due`,`sensor.${e}_readiness`,`binary_sensor.${e}_schedule_hold_active`,`sensor.${e}_next_clean`,`sensor.${e}_filter_remaining_hours`,`sensor.${e}_brush_remaining_hours`,`sensor.${e}_mop_pad`,`sensor.${e}_mop_tank_level`,`sensor.${e}_mop_behavior`,`sensor.${e}_clean_base_status`,`sensor.${e}_nav_quality`,`sensor.${e}_nav_panics`,`sensor.${e}_nav_landmark_quality`,`sensor.${e}_nav_good_landmarks`,`sensor.${e}_next_likely_clean_window`,`sensor.${e}_presence_clean_opportunities_7d`,`sensor.${e}_presence_clean_utilisation_7d`,`sensor.${e}_cleaning_passes`,`select.${e}_cleaning_passes`,`select.${e}_smart_zone_select`,`select.${e}_zone_select`,`sensor.${e}_clean_streak`,`sensor.${e}_completion_rate_30d`,`sensor.${e}_lifetime_missions`,`sensor.${e}_cleaning_analytics_30d`,`sensor.${e}_battery_capacity_retention`,`sensor.${e}_estimated_battery_eol`,`sensor.${e}_wifi_health`,`sensor.${e}_recent_coverage_pct`,`sensor.${e}_missions_last_30d`,`sensor.${e}_average_mission_time`,`sensor.${e}_cleaning_performance`,`binary_sensor.${e}_consecutive_clean_skips`,`sensor.${e}_area_cleaned_today`,`sensor.${e}_mission_expire_time`,`image.${e}_coverage_map`,`sensor.${e}_robot_health_score`,`sensor.${e}_wheel_last_cleaned`,`sensor.${e}_contact_last_cleaned`,`sensor.${e}_bin_last_cleaned`,`sensor.${e}_battery_last_replaced`,`sensor.${e}_mission_progress`,`sensor.${e}_last_mission_result`,`sensor.${e}_consecutive_mission_anomalies`,`select.${e}_carpet_boost_select`,`switch.${e}_edge_clean`,`switch.${e}_always_finish`,`binary_sensor.${e}_demand_clean_blocked`,`sensor.${e}_optimal_clean_window`,`binary_sensor.${e}_cloud_connected`,`binary_sensor.${e}_mqtt_stale`,`sensor.${e}_firmware_version`,`device_tracker.${e}_position`,...this.config.robot_selector_helper?[this.config.robot_selector_helper]:[]]}entityList(){return this.config.entities&&this.config.entities.length>0?this.config.entities:[this.config.entity]}resetRobotState(){this.apiClient=null,this.missionData=null,this.firstRecord=null,this.firstSummary=null,this.historyLoading=!1,this.historyError=null,this.selectedRooms=new Set,this.passes="Auto",this.passSettingInFlight=!1,this.openPopover=null,this.legendShown=!1,this.healthDetailsExpanded=!1,this.openMaintPopover=null,this.activeTab=null,this.roomPickerOpen=!1,this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.settingsPanelOpen=!1,this.lifetimeExpanded=!1,this.hazards=[],this.historyTab="calendar",this.householdData=null,this.prevVacuumState="",this.prevMissionActive="",this.alertsVisible=!1,this.lastAlertHtml="",this.clearAllTimers()}async switchRobot(e){if(e===this.activeRobot)return;this.activeRobot=e,this.robotName=e.replace("vacuum.",""),this.resetRobotState(),this.config.show_history!==!1&&this._hass&&(this.apiClient=new ve(this._hass,this.config,e),this.loadHistory()),this.render();let r=this.config.robot_selector_helper;if(r&&this._hass.states[r]){let o=r.split(".")[0],s=o==="input_select"?"select_option":"set_value",n=o==="input_select"?{entity_id:r,option:e}:{entity_id:r,value:e};try{await this._hass.callService(o,s,n)}catch(l){console.warn("roomba-plus-card: robot_selector_helper write failed",l)}}}maybeSubscribeMissionEvents(){if(this.missionEventUnsub||this.missionEventSubscribing)return;let e=this._hass?.connection;!e||!this.apiClient||(this.missionEventSubscribing=!0,e.subscribeMessage(r=>{this.onMissionCompletedEvent(r?.data?.entry_id)},{type:"subscribe_events",event_type:"roomba_plus_mission_completed"}).then(r=>{this.missionEventUnsub=r,this.missionEventSubscribing=!1}).catch(()=>{this.missionEventSubscribing=!1}))}async onMissionCompletedEvent(e){if(!this.apiClient)return;let r=null;try{r=await this.apiClient.getEntryId()}catch{r=null}rt(r,e)&&this.loadHistory()}async loadHistory(){if(!this.apiClient||this.historyLoading)return;let e=this.activeRobot;this.historyLoading=!0,this.historyError=null,this.render();try{let r=this.config.history_days??28,o=await this.apiClient.fetchSummary(r),s=await this.apiClient.fetchRecords(r);if(s.length>0){let i=new Map;for(let c of s){let p=c.started_at.slice(0,10);i.has(p)||i.set(p,[]),i.get(p).push(c)}for(let c of o){let p=i.get(c.date);p&&(c.missions=p.sort((d,u)=>d.started_at.localeCompare(u.started_at)))}}let n=await this.apiClient.fetchHazards(),l=(this.config.entities?.length??0)>=2?await this.apiClient.fetchHousehold(r):null;this.missionData=o,this.firstRecord=s.length>0?s[s.length-1]:null,this.firstSummary=o.length>0?o[o.length-1]:null,this.hazards=n,this.householdData=l}catch(r){let o=r.message;this.historyError=o==="404"?"History requires Roomba+ v1.8 or later":"History temporarily unavailable"}finally{if(this.activeRobot!==e)return;this.historyLoading=!1,this.render()}}render(){if(!this.config||!this._hass)return;let e=xe(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),r=this._hass.config?.unit_system?.length==="m",o=new Date,s=`${o.getFullYear()}-${String(o.getMonth()+1).padStart(2,"0")}-${String(o.getDate()).padStart(2,"0")}`,l=(this.missionData?.find(x=>x.date===s)??null)?.total??null;this.activeTab===null&&(this.activeTab=Te(this.config,e));let i=Ye(this.config,e);i.some(x=>x.id===this.activeTab)||(this.activeTab=Te(this.config,e));let c=Ve(this._hass,this.config,e,this.robotName),p=c;c?(this.alertCollapseTimer!==null&&(clearTimeout(this.alertCollapseTimer),this.alertCollapseTimer=null),this.alertsVisible=!0,this.lastAlertHtml=c):this.alertsVisible&&(this.alertCollapseTimer===null&&(this.alertCollapseTimer=setTimeout(()=>{this.alertsVisible=!1,this.alertCollapseTimer=null,this.render()},100)),p=this.lastAlertHtml);let d=Ue({hass:this._hass,config:this.config,caps:e,robotName:this.robotName,loadingAction:this.loadingAction,todayMissionCount:l,missionData:this.missionData,roomPickerOpen:this.roomPickerOpen,selectedRoomCount:this.selectedRooms.size,activeRobot:this.activeRobot}),u=this.roomPickerOpen?ye({hass:this._hass,config:this.config,caps:e,robotName:this.robotName,selectedRooms:this.selectedRooms,passes:this.passes,isSending:this.isSendingClean,sendError:this.sendError,settingsPanelOpen:!1}):"",f={health:Ge(this._hass,e,this.robotName),history:Je(this._hass,e,this.robotName)},w=Qe(i,this.activeTab,f),h=ut(this.activeTab,{hass:this._hass,config:this.config,caps:e,robotName:this.robotName,isMetric:r,missionData:this.missionData,historyLoading:this.historyLoading,historyError:this.historyError,openDay:this.openDay,dayMissions:this.dayMissions,openDaySummary:this.openDaySummary,lifetimeExpanded:this.lifetimeExpanded,historyTab:this.historyTab,hazards:this.hazards,selectedRooms:this.selectedRooms,openPopover:this.openPopover,resetting:this.resetting,resetError:this.resetError,legendShown:this.legendShown,healthDetailsExpanded:this.healthDetailsExpanded,openMaintPopover:this.openMaintPopover,navDetailsExpanded:this.navDetailsExpanded,holdTooltipVisible:this.holdTooltipVisible,holdToggling:this.holdToggling,settingsPanelOpen:this.settingsPanelOpen,isSendingClean:this.isSendingClean,sendError:this.sendError,passes:this.passes,maintenanceLinksHtml:this.renderMaintenanceLinks(e),alertZoneHtml:p}),v=this.viewMode==="household"?`
        <button class="rpc-household-back" data-household-back>\u2190 Back</button>
        ${qe(this._hass,this.config,e,this.householdData,r)}
      `:`
        ${d}
        ${u}
        ${w}
        <div class="rpc-tab-panel">
          ${h}
        </div>
      `,y=`
      <style>${vt}</style>
      <div class="rpc-card">
        ${this.renderRobotSelectorBar()}
        ${v}
      </div>
    `;this.root.innerHTML=y}renderMaintenanceLinks(e){if(!e.hasMaintenanceCalendar&&!this._hass.states[`sensor.${this.robotName}_battery_capacity_retention`])return"";let r=this.robotName,o=[];return this._hass.states[`sensor.${r}_wheel_last_cleaned`]&&o.push({label:"Wheel cleaning",service:"roomba_plus.reset_wheel_cleaning",tsEntityId:`sensor.${r}_wheel_last_cleaned`}),this._hass.states[`sensor.${r}_contact_last_cleaned`]&&o.push({label:"Contact cleaning",service:"roomba_plus.reset_contact_cleaning",tsEntityId:`sensor.${r}_contact_last_cleaned`}),this._hass.states[`sensor.${r}_bin_last_cleaned`]&&o.push({label:"Bin cleaning",service:"roomba_plus.reset_bin_cleaning",tsEntityId:`sensor.${r}_bin_last_cleaned`}),this._hass.states[`sensor.${r}_battery_capacity_retention`]&&o.push({label:"Battery baseline",service:"roomba_plus.reset_battery",tsEntityId:`sensor.${r}_battery_last_replaced`}),o.length===0?"":`
      <div class="rpc-settings-divider"></div>
      <div class="rpc-zone-header">MAINTENANCE</div>
      ${o.map(s=>{let n=this._hass.states[s.tsEntityId],i=!!n&&n.state!=="unavailable"&&n.state!=="unknown"?`Reset ${J(n.state,this._hass.language)}`:"Never recorded";return`
          <div class="rpc-maint-link-row">
            <span class="rpc-maint-link-label">${s.label}</span>
            <span class="rpc-maint-link-service">${s.service}</span>
          </div>
          <div class="rpc-maint-link-lastreset">${i}</div>
        `}).join("")}
      <div class="rpc-maint-link-hint">Trigger via Developer Tools \u2192 Services</div>
    `}renderRobotSelectorBar(){let e=this.entityList();if(e.length<2)return"";let r=e.map(s=>{let n=this._hass.states[s]?.attributes?.friendly_name??s,l=this.viewMode==="robot"&&s===this.activeRobot?" selected":"";return`<option value="${s}"${l}>${n}</option>`}).join(""),o=this.viewMode==="household"?" selected":"";return`
      <div class="rpc-robot-selector">
        <select class="rpc-robot-select" data-robot-select>
          <optgroup label="My robots">${r}</optgroup>
          <optgroup label="View">
            <option value="__household__"${o}>\u{1F4CA} Household summary</option>
          </optgroup>
        </select>
      </div>`}dispatchClick(e,r){let o=r.dataset;if(mt(e)){let s={room:o.room??o.roomPoly??o.roomLabel,tab:o.tab,bar:o.bar,maint:o.maint,historyTab:o.historyTab};if(e==="heatmap-cell"){let l=r.getAttribute("data-date");s.date=l,this.openDay!==l&&(s.daySummaryForDate=this.missionData?.find(i=>i.date===l)??null,s.dayMissionsForDate=this.buildDayMissions(l))}let n=ht(e,this,s);Object.assign(this,n),this.render(),e==="bar"&&!this.legendShown&&this.root.querySelector("[data-wear-legend]")&&(this.legendShown=!0);return}switch(e){case"action":this.handleAction(o.action);return;case"pass":{let s=o.pass,n=o.passOption;this.passes=s,this.render();let l=`select.${this.robotName}_cleaning_passes`;this._hass.states[l]&&(this.passSettingInFlight=!0,this._hass.callService("select","select_option",{entity_id:l,option:n}).catch(()=>{}).finally(()=>{this.passSettingInFlight=!1}));return}case"reset":{let s=o.reset,n=o.service;this.resetting=s,this.resetError=null,this.render(),(async()=>{try{await this._hass.callService("roomba_plus",n,{entity_id:this.activeRobot}),await new Promise(l=>setTimeout(l,800)),this.openPopover=null}catch{this.resetError=s}finally{this.resetting=null,this.render()}})();return}case"hold-action":{if(o.holdAction==="tooltip")this.holdTooltipVisible=!0,this.render(),this.holdTooltipTimer!==null&&clearTimeout(this.holdTooltipTimer),this.holdTooltipTimer=setTimeout(()=>{this.holdTooltipVisible=!1,this.holdTooltipTimer=null,this.render()},3e3);else{let s=`switch.${this.robotName}_schedule_hold`,n=this._hass.states[s]?.state==="on";this.holdToggling=!0,this.render(),this._hass.callService("switch",n?"turn_off":"turn_on",{entity_id:s}).catch(()=>{}).finally(()=>{this.holdToggling=!1,this.render()})}return}case"switch-entity":{let s=o.switchEntity,n=this._hass.states[s]?.state==="on";this._hass.callService("switch",n?"turn_off":"turn_on",{entity_id:s}).catch(()=>{});return}case"cycle-entity":{let s=o.cycleEntity,n=[];try{n=JSON.parse(o.cycleOptions??"[]")}catch{n=[]}let l=o.cycleCurrent??"",i=n.indexOf(l),c=n.length>0?n[(i+1)%n.length]:null;c&&this._hass.callService("select","select_option",{entity_id:s,option:c}).catch(()=>{});return}case"fav-entity":{let s=o.favEntity;this._hass.callService("button","press",{entity_id:s}).catch(()=>{});return}}}buildDayMissions(e){let r=this.missionData?.find(o=>o.date===e);return!r||r.total===0?[]:r.missions&&r.missions.length>0?r.missions:[]}async handleAction(e){let r=gt(e);switch(r.kind){case"toggle-room-picker":this.roomPickerOpen=!this.roomPickerOpen,this.render();return;case"clean-selected":return this.runCleanSelected();case"repeat-last":return this.runRepeatLast();case"vacuum":return this.runVacuumAction(r.domain,r.service,r.action,r.pulse);case"noop":return}}async runCleanSelected(){let e=this.activeRobot,r=this.robotName;this.isSendingClean=!0,this.sendError=null,this.render();let o=Array.from(this.selectedRooms);this.cleanTimeoutTimer=setTimeout(()=>{this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app",this.cleanTimeoutTimer=null,this.render()},8e3);try{let s=`select.${r}_cleaning_passes`;this.passes!=="Auto"&&this._hass.states[s]&&await this._hass.callService("select","select_option",{entity_id:s,option:$e[this.passes]??this.passes}),await this._hass.callService("roomba_plus","clean_room",{entity_id:e,room_name:o,ordered:!1}),clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null,this.selectedRooms.clear(),this.isSendingClean=!1}catch{this.cleanTimeoutTimer!==null&&(clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null),this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app"}this.render()}async runRepeatLast(){let e=this.robotName;try{await this._hass.callService("button","press",{entity_id:`button.${e}_repeat_mission`})}catch{}}async runVacuumAction(e,r,o,s){let n=this.activeRobot;if(this.loadingAction=o,this.render(),s){this.locateTimer=setTimeout(()=>{this.loadingAction=null,this.locateTimer=null,this.render()},2e3);try{await this._hass.callService(e,r,{entity_id:n})}catch{}return}this.actionResetTimer=setTimeout(()=>{this.loadingAction=null,this.actionResetTimer=null,this.render()},5e3);try{await this._hass.callService(e,r,{entity_id:n})}finally{this.actionResetTimer!==null&&(clearTimeout(this.actionResetTimer),this.actionResetTimer=null),this.loadingAction=null,this.render()}}getCardSize(){if(!this.config||!this._hass)return 10;let e=xe(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),r=4;return e.hasSmartZones&&this.config.show_rooms!==!1&&(r+=3),this.config.show_health!==!1&&(r+=2),this.config.show_schedule!==!1&&(r+=2),this.config.show_history!==!1&&(r+=4),r}static getConfigForm(){return{schema:tt()}}static getStubConfig(){return{entity:"vacuum.roomba"}}};typeof customElements<"u"&&customElements.define("roomba-plus-card",He);typeof window<"u"&&(window.customCards??(window.customCards=[]),window.customCards.push({type:"roomba-plus-card",name:"Roomba+ Card",description:"Full-featured card for the roomba_plus integration",preview:!0,documentationURL:"https://github.com/johnnyh1975/ha_roomba_plus_card"}));
