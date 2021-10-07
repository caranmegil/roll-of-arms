<template>
  <div v-if="isLoaded" class="roll-of-arms-body">
    <header>
      <span id="menu-button" @click="openMenu" v-if="$store.state.user != null" class="title-bar-menu material-icons material-icons-outlined">menu</span>
      <span class="title-bar-banner"><img class="banner-img" src="./assets/banner.webp"/></span>
      <div v-if="$store.state.user != null" class="title-bar-account">
        <img @click="editProfile" class="profile-image" :src="getGravatarPhoto()"/>
      </div>
    </header>
    <div id="menu" class="menu-container">
      <div @click="openDiceBrowser" class="menu-item"><span class="material-icons material-icons-outlined">square</span> Dice Browser</div>
      <div @click="editCollection" class="menu-item"><span class="material-icons material-icons-outlined">list</span> Dice Collection</div>
      <div class="separator"></div>
      <div @click="logoff" class="menu-item"><span class="material-icons material-icons-outlined">logout</span> Sign Off</div>
    </div>

    <main>
      <section id="content">
        <router-view v-slot="{ Component }">
            <component :is="Component" :key="$route.path"/> 
        </router-view>
      </section>
    </main>

    <div id="footer">
      <footer>
        <a href="https://www.sfr-inc.com/dragondice.php" target="_blank"><img src="./assets/dr-logo-large.webp"/></a>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import 'es6-promise/auto';
import {
  signIntoGoogle,
  signOutOfGoogle,
  // isVerifyEmailWithLink,
} from '@/firebase';

export default {
  name: 'App',
  data() {
    return {
      isLoaded: false,
    }
  },
  components: {
  },
  mounted() {
    this.$router.beforeEach( async (to, from, next) => {
      const credentials = this.$store.state.credentials;

      if ( this.$store.state.user == null && credentials && credentials.email ) {
        let user = await signIntoGoogle(credentials.email, credentials.password);
        this.setUser(user);
      }

      if (to.meta.requiresAuth) {
        if(this.$store.state.user != null) {
          next();
        } else {
          next({ path: '/signin'});
        }
      } else {
        next();
      }
    });

    this.isLoaded = true;
  },
  methods: {
    ...mapActions(['setUser', 'setProfileMenuState', 'signOut']),
    openMenu: function() {
      let menuElem = document.getElementById('menu');
      if(window.getComputedStyle(menuElem).display === 'none') {
        menuElem.style.display = 'block';
      } else {
        menuElem.style.display = 'none';
      }
    },
    openDiceBrowser: function () {
      let menuElem = document.getElementById('menu');
      menuElem.style.display = 'none';
      this.$router.push('/dicebrowser');
    },
    editProfile: function () {
      let menuElem = document.getElementById('menu');
      menuElem.style.display = 'none';
      this.setProfileMenuState(false);
      this.$router.push('/profile')
    },
    logoff: async function () {
      const isSignedOut = await signOutOfGoogle();

      if (isSignedOut) {
        let menuElem = document.getElementById('menu');
        menuElem.style.display = 'none';
        this.signOut();
        this.$router.push('/signin');
      }
    },
    showProfileMenu() {
      this.setProfileMenuState(!this.$store.state.isProfileMenuOpen);
    },
    getGravatarPhoto() {
      if (this.$store.state.user != null) {
        var MD5=function(s){function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]|(G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()};
        return `https://www.gravatar.com/avatar/${MD5(this.$store.state.user.email)}.jpg`;
      } else {
        return '';
      }
    },
  },
};
</script>

<style>
body {
    font-family: 'Roboto', sans-serif;
    padding: .5em;
    background-color: #F8F6F0;
}

@media screen and (max-width: 480px) {
    .material-icons {
        font-size: 24px !important;
    }

    .profile-image {
      width: 24px;
      height: 24px;
    }


  .image-icon {
    width: 24px;
    height: 24px;
  }

}

@media screen and (max-width: 768px) {
    .roll-of-arms-body {
        height: 200vh;
    }

    .material-icons { 
        font-size: 32px !important;
    }

  .image-icon {
    width: 32px;
    height: 32px;
  }

  .profile-image {
      width: 32px;
      height: 32px;
    }
}

button {
  border-radius: .75em;
  padding: .5em;
  color: ivory;
  background-color: #525252;
}

.menu-container {
  background-color: ivory;
  border: 3px solid #D3D3D3;
  display: none;
  position: fixed;
  z-index: 9999999;
  left: .75em;
  top: 5.5em;
  width: 25%;
  grid-auto-flow: row;
}

.image-icon {
  width: 48px;
  height: 48px;
}

.banner-img {
  width: 75%;
  height: 75%;
}

.material-icons { font-size: 48px; }
.profile-image {
  width: 48px;
  height: 48px;
}

.roll-of-arms-body {
    height: 95vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    grid-template-columns: 1fr;
    grid-template-areas: 'header' 'main';
}

.roll-of-arms-body > header {
    padding-bottom: .75em;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-auto-flow: column;
    border-bottom: 1px solid #D3D3D3;
}

.roll-of-arms-body > header > .title-bar-menu {
    grid-row: 1;
    grid-column: 1;
    align-self: center;
    justify-self: start;
}

.roll-of-arms-body > header > .title-bar-banner {
    grid-row: 1;
    grid-column: 2;
    align-self: center;
    justify-self: start;
}

.roll-of-arms-body > header >  .title-bar-account {
    grid-row: 1;
    grid-column: 3;
    align-self: center;
    justify-self: end;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
}

.menu-item {
  display: grid;
  grid-auto-flow: row;
  grid-template-columns: auto 1fr;
  align-items: center;
  padding: 2px;
}

.menu-item:hover {
  border-bottom: 2px solid red;
}

.roll-of-arms-body > main {
    display: grid;
    grid-template-rows: 1fr auto;
    grid-template-columns: 1fr minmax(0, 600px) 1fr;
    grid-area: main;
    overflow: auto;
}

.roll-of-arms-body > main > section#content {
    grid-row: 1;
    grid-column: span 4;
    padding-top: .75em
}

.roll-of-arms-body > main > section#content > * {
    overflow: auto;
}

.roll-of-arms-body > div#footer {
    border-top: 1px solid #D3D3D3;
    grid-row: 3;
    grid-column: span 4;
    align-self: auto;
    display: grid;
}

.roll-of-arms-body > div#footer > footer {
    grid-area: 1 / 1 / 1 / 3;
    align-self: center;
    justify-self: center;
}

.separator {
  border-bottom: 1px solid #D3D3D3;
}

a {
  font-weight: bold;
}

a:link, a:visited {
  color: black;
}

a:hover {
  color: red;
}
</style>
