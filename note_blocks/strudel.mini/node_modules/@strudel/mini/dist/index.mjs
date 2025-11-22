import * as y from "@strudel/core";
function Or(t, i) {
  function e() {
    this.constructor = t;
  }
  e.prototype = i.prototype, t.prototype = new e();
}
function uu(t, i, e, f) {
  var l = Error.call(this, t);
  return Object.setPrototypeOf && Object.setPrototypeOf(l, uu.prototype), l.expected = i, l.found = e, l.location = f, l.name = "SyntaxError", l;
}
Or(uu, Error);
function Cu(t, i, e) {
  return e = e || " ", t.length > i ? t : (i -= t.length, e += e.repeat(i), t + e.slice(0, i));
}
uu.prototype.format = function(t) {
  var i = "Error: " + this.message;
  if (this.location) {
    var e = null, f;
    for (f = 0; f < t.length; f++)
      if (t[f].source === this.location.source) {
        e = t[f].text.split(/\r\n|\n|\r/g);
        break;
      }
    var l = this.location.start, a = this.location.source && typeof this.location.source.offset == "function" ? this.location.source.offset(l) : l, D = this.location.source + ":" + a.line + ":" + a.column;
    if (e) {
      var v = this.location.end, g = Cu("", a.line.toString().length, " "), c = e[l.line - 1], F = l.line === v.line ? v.column : c.length + 1, p = F - l.column || 1;
      i += `
 --> ` + D + `
` + g + ` |
` + a.line + " | " + c + `
` + g + " | " + Cu("", l.column - 1, " ") + Cu("", p, "^");
    } else
      i += `
 at ` + D;
  }
  return i;
};
uu.buildMessage = function(t, i) {
  var e = {
    literal: function(c) {
      return '"' + l(c.text) + '"';
    },
    class: function(c) {
      var F = c.parts.map(function(p) {
        return Array.isArray(p) ? a(p[0]) + "-" + a(p[1]) : a(p);
      });
      return "[" + (c.inverted ? "^" : "") + F.join("") + "]";
    },
    any: function() {
      return "any character";
    },
    end: function() {
      return "end of input";
    },
    other: function(c) {
      return c.description;
    }
  };
  function f(c) {
    return c.charCodeAt(0).toString(16).toUpperCase();
  }
  function l(c) {
    return c.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(F) {
      return "\\x0" + f(F);
    }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(F) {
      return "\\x" + f(F);
    });
  }
  function a(c) {
    return c.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(F) {
      return "\\x0" + f(F);
    }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(F) {
      return "\\x" + f(F);
    });
  }
  function D(c) {
    return e[c.type](c);
  }
  function v(c) {
    var F = c.map(D), p, w;
    if (F.sort(), F.length > 0) {
      for (p = 1, w = 1; p < F.length; p++)
        F[p - 1] !== F[p] && (F[w] = F[p], w++);
      F.length = w;
    }
    switch (F.length) {
      case 1:
        return F[0];
      case 2:
        return F[0] + " or " + F[1];
      default:
        return F.slice(0, -1).join(", ") + ", or " + F[F.length - 1];
    }
  }
  function g(c) {
    return c ? '"' + l(c) + '"' : "end of input";
  }
  return "Expected " + v(t) + " but " + g(i) + " found.";
};
function Mr(t, i) {
  i = i !== void 0 ? i : {};
  var e = {}, f = i.grammarSource, l = { start: Uu }, a = Uu, D = ".", v = "-", g = "0", c = ",", F = "|", p = "[", w = "]", P = "{", R = "}", su = "%", iu = "<", re = ">", ne = "!", se = "(", ie = ")", fe = "/", oe = "*", ae = "?", le = ":", Eu = "..", ce = "^", vu = "struct", $u = "target", mu = "euclid", _u = "slow", yu = "rotL", wu = "rotR", bu = "fast", xu = "scale", Iu = "//", ku = "cat", Ae = "$", Nu = "setcps", Pu = "setbpm", qu = "hush", pe = /^[1-9]/, ge = /^[eE]/, Fe = /^[+\-]/, he = /^[0-9]/, ju = /^[ \n\r\t\xA0]/, Be = /^["']/, Ce = /^[#\--.0-9A-Z\^-_a-z~\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376-\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06E5-\u06E6\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4-\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u09FC\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60-\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0CF1-\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32-\u0E33\u0E40-\u0E46\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5-\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7B9\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD-\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5-\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/, De = /^[@_]/, Su = /^[^\n]/, de = pu("number"), Ru = _(".", !1), Ee = O([["1", "9"]], !1, !1), ve = O(["e", "E"], !1, !1), $e = O(["+", "-"], !1, !1), me = _("-", !1), _e = _("0", !1), ye = O([["0", "9"]], !1, !1), we = pu("whitespace"), Lu = O([" ", `
`, "\r", "	", " "], !1, !1), be = _(",", !1), xe = _("|", !1), Ie = O(['"', "'"], !1, !1), ke = pu('a letter, a number, "-", "#", ".", "^", "_"'), Ne = O(["#", ["-", "."], ["0", "9"], ["A", "Z"], ["^", "_"], ["a", "z"], "~", "ª", "µ", "º", ["À", "Ö"], ["Ø", "ö"], ["ø", "ˁ"], ["ˆ", "ˑ"], ["ˠ", "ˤ"], "ˬ", "ˮ", ["Ͱ", "ʹ"], ["Ͷ", "ͷ"], ["ͺ", "ͽ"], "Ϳ", "Ά", ["Έ", "Ί"], "Ό", ["Ύ", "Ρ"], ["Σ", "ϵ"], ["Ϸ", "ҁ"], ["Ҋ", "ԯ"], ["Ա", "Ֆ"], "ՙ", ["ՠ", "ֈ"], ["א", "ת"], ["ׯ", "ײ"], ["ؠ", "ي"], ["ٮ", "ٯ"], ["ٱ", "ۓ"], "ە", ["ۥ", "ۦ"], ["ۮ", "ۯ"], ["ۺ", "ۼ"], "ۿ", "ܐ", ["ܒ", "ܯ"], ["ݍ", "ޥ"], "ޱ", ["ߊ", "ߪ"], ["ߴ", "ߵ"], "ߺ", ["ࠀ", "ࠕ"], "ࠚ", "ࠤ", "ࠨ", ["ࡀ", "ࡘ"], ["ࡠ", "ࡪ"], ["ࢠ", "ࢴ"], ["ࢶ", "ࢽ"], ["ऄ", "ह"], "ऽ", "ॐ", ["क़", "ॡ"], ["ॱ", "ঀ"], ["অ", "ঌ"], ["এ", "ঐ"], ["ও", "ন"], ["প", "র"], "ল", ["শ", "হ"], "ঽ", "ৎ", ["ড়", "ঢ়"], ["য়", "ৡ"], ["ৰ", "ৱ"], "ৼ", ["ਅ", "ਊ"], ["ਏ", "ਐ"], ["ਓ", "ਨ"], ["ਪ", "ਰ"], ["ਲ", "ਲ਼"], ["ਵ", "ਸ਼"], ["ਸ", "ਹ"], ["ਖ਼", "ੜ"], "ਫ਼", ["ੲ", "ੴ"], ["અ", "ઍ"], ["એ", "ઑ"], ["ઓ", "ન"], ["પ", "ર"], ["લ", "ળ"], ["વ", "હ"], "ઽ", "ૐ", ["ૠ", "ૡ"], "ૹ", ["ଅ", "ଌ"], ["ଏ", "ଐ"], ["ଓ", "ନ"], ["ପ", "ର"], ["ଲ", "ଳ"], ["ଵ", "ହ"], "ଽ", ["ଡ଼", "ଢ଼"], ["ୟ", "ୡ"], "ୱ", "ஃ", ["அ", "ஊ"], ["எ", "ஐ"], ["ஒ", "க"], ["ங", "ச"], "ஜ", ["ஞ", "ட"], ["ண", "த"], ["ந", "ப"], ["ம", "ஹ"], "ௐ", ["అ", "ఌ"], ["ఎ", "ఐ"], ["ఒ", "న"], ["ప", "హ"], "ఽ", ["ౘ", "ౚ"], ["ౠ", "ౡ"], "ಀ", ["ಅ", "ಌ"], ["ಎ", "ಐ"], ["ಒ", "ನ"], ["ಪ", "ಳ"], ["ವ", "ಹ"], "ಽ", "ೞ", ["ೠ", "ೡ"], ["ೱ", "ೲ"], ["അ", "ഌ"], ["എ", "ഐ"], ["ഒ", "ഺ"], "ഽ", "ൎ", ["ൔ", "ൖ"], ["ൟ", "ൡ"], ["ൺ", "ൿ"], ["අ", "ඖ"], ["ක", "න"], ["ඳ", "ර"], "ල", ["ව", "ෆ"], ["ก", "ะ"], ["า", "ำ"], ["เ", "ๆ"], ["ກ", "ຂ"], "ຄ", ["ງ", "ຈ"], "ຊ", "ຍ", ["ດ", "ທ"], ["ນ", "ຟ"], ["ມ", "ຣ"], "ລ", "ວ", ["ສ", "ຫ"], ["ອ", "ະ"], ["າ", "ຳ"], "ຽ", ["ເ", "ໄ"], "ໆ", ["ໜ", "ໟ"], "ༀ", ["ཀ", "ཇ"], ["ཉ", "ཬ"], ["ྈ", "ྌ"], ["က", "ဪ"], "ဿ", ["ၐ", "ၕ"], ["ၚ", "ၝ"], "ၡ", ["ၥ", "ၦ"], ["ၮ", "ၰ"], ["ၵ", "ႁ"], "ႎ", ["Ⴀ", "Ⴥ"], "Ⴧ", "Ⴭ", ["ა", "ჺ"], ["ჼ", "ቈ"], ["ቊ", "ቍ"], ["ቐ", "ቖ"], "ቘ", ["ቚ", "ቝ"], ["በ", "ኈ"], ["ኊ", "ኍ"], ["ነ", "ኰ"], ["ኲ", "ኵ"], ["ኸ", "ኾ"], "ዀ", ["ዂ", "ዅ"], ["ወ", "ዖ"], ["ዘ", "ጐ"], ["ጒ", "ጕ"], ["ጘ", "ፚ"], ["ᎀ", "ᎏ"], ["Ꭰ", "Ᏽ"], ["ᏸ", "ᏽ"], ["ᐁ", "ᙬ"], ["ᙯ", "ᙿ"], ["ᚁ", "ᚚ"], ["ᚠ", "ᛪ"], ["ᛮ", "ᛸ"], ["ᜀ", "ᜌ"], ["ᜎ", "ᜑ"], ["ᜠ", "ᜱ"], ["ᝀ", "ᝑ"], ["ᝠ", "ᝬ"], ["ᝮ", "ᝰ"], ["ក", "ឳ"], "ៗ", "ៜ", ["ᠠ", "ᡸ"], ["ᢀ", "ᢄ"], ["ᢇ", "ᢨ"], "ᢪ", ["ᢰ", "ᣵ"], ["ᤀ", "ᤞ"], ["ᥐ", "ᥭ"], ["ᥰ", "ᥴ"], ["ᦀ", "ᦫ"], ["ᦰ", "ᧉ"], ["ᨀ", "ᨖ"], ["ᨠ", "ᩔ"], "ᪧ", ["ᬅ", "ᬳ"], ["ᭅ", "ᭋ"], ["ᮃ", "ᮠ"], ["ᮮ", "ᮯ"], ["ᮺ", "ᯥ"], ["ᰀ", "ᰣ"], ["ᱍ", "ᱏ"], ["ᱚ", "ᱽ"], ["ᲀ", "ᲈ"], ["Ა", "Ჺ"], ["Ჽ", "Ჿ"], ["ᳩ", "ᳬ"], ["ᳮ", "ᳱ"], ["ᳵ", "ᳶ"], ["ᴀ", "ᶿ"], ["Ḁ", "ἕ"], ["Ἐ", "Ἕ"], ["ἠ", "ὅ"], ["Ὀ", "Ὅ"], ["ὐ", "ὗ"], "Ὑ", "Ὓ", "Ὕ", ["Ὗ", "ώ"], ["ᾀ", "ᾴ"], ["ᾶ", "ᾼ"], "ι", ["ῂ", "ῄ"], ["ῆ", "ῌ"], ["ῐ", "ΐ"], ["ῖ", "Ί"], ["ῠ", "Ῥ"], ["ῲ", "ῴ"], ["ῶ", "ῼ"], "ⁱ", "ⁿ", ["ₐ", "ₜ"], "ℂ", "ℇ", ["ℊ", "ℓ"], "ℕ", ["ℙ", "ℝ"], "ℤ", "Ω", "ℨ", ["K", "ℭ"], ["ℯ", "ℹ"], ["ℼ", "ℿ"], ["ⅅ", "ⅉ"], "ⅎ", ["Ⅰ", "ↈ"], ["Ⰰ", "Ⱞ"], ["ⰰ", "ⱞ"], ["Ⱡ", "ⳤ"], ["Ⳬ", "ⳮ"], ["Ⳳ", "ⳳ"], ["ⴀ", "ⴥ"], "ⴧ", "ⴭ", ["ⴰ", "ⵧ"], "ⵯ", ["ⶀ", "ⶖ"], ["ⶠ", "ⶦ"], ["ⶨ", "ⶮ"], ["ⶰ", "ⶶ"], ["ⶸ", "ⶾ"], ["ⷀ", "ⷆ"], ["ⷈ", "ⷎ"], ["ⷐ", "ⷖ"], ["ⷘ", "ⷞ"], "ⸯ", ["々", "〇"], ["〡", "〩"], ["〱", "〵"], ["〸", "〼"], ["ぁ", "ゖ"], ["ゝ", "ゟ"], ["ァ", "ヺ"], ["ー", "ヿ"], ["ㄅ", "ㄯ"], ["ㄱ", "ㆎ"], ["ㆠ", "ㆺ"], ["ㇰ", "ㇿ"], ["㐀", "䶵"], ["一", "鿯"], ["ꀀ", "ꒌ"], ["ꓐ", "ꓽ"], ["ꔀ", "ꘌ"], ["ꘐ", "ꘟ"], ["ꘪ", "ꘫ"], ["Ꙁ", "ꙮ"], ["ꙿ", "ꚝ"], ["ꚠ", "ꛯ"], ["ꜗ", "ꜟ"], ["Ꜣ", "ꞈ"], ["Ꞌ", "ꞹ"], ["ꟷ", "ꠁ"], ["ꠃ", "ꠅ"], ["ꠇ", "ꠊ"], ["ꠌ", "ꠢ"], ["ꡀ", "ꡳ"], ["ꢂ", "ꢳ"], ["ꣲ", "ꣷ"], "ꣻ", ["ꣽ", "ꣾ"], ["ꤊ", "ꤥ"], ["ꤰ", "ꥆ"], ["ꥠ", "ꥼ"], ["ꦄ", "ꦲ"], "ꧏ", ["ꧠ", "ꧤ"], ["ꧦ", "ꧯ"], ["ꧺ", "ꧾ"], ["ꨀ", "ꨨ"], ["ꩀ", "ꩂ"], ["ꩄ", "ꩋ"], ["ꩠ", "ꩶ"], "ꩺ", ["ꩾ", "ꪯ"], "ꪱ", ["ꪵ", "ꪶ"], ["ꪹ", "ꪽ"], "ꫀ", "ꫂ", ["ꫛ", "ꫝ"], ["ꫠ", "ꫪ"], ["ꫲ", "ꫴ"], ["ꬁ", "ꬆ"], ["ꬉ", "ꬎ"], ["ꬑ", "ꬖ"], ["ꬠ", "ꬦ"], ["ꬨ", "ꬮ"], ["ꬰ", "ꭚ"], ["ꭜ", "ꭥ"], ["ꭰ", "ꯢ"], ["가", "힣"], ["ힰ", "ퟆ"], ["ퟋ", "ퟻ"], ["豈", "舘"], ["並", "龎"], ["ﬀ", "ﬆ"], ["ﬓ", "ﬗ"], "יִ", ["ײַ", "ﬨ"], ["שׁ", "זּ"], ["טּ", "לּ"], "מּ", ["נּ", "סּ"], ["ףּ", "פּ"], ["צּ", "ﮱ"], ["ﯓ", "ﴽ"], ["ﵐ", "ﶏ"], ["ﶒ", "ﷇ"], ["ﷰ", "ﷻ"], ["ﹰ", "ﹴ"], ["ﹶ", "ﻼ"], ["Ａ", "Ｚ"], ["ａ", "ｚ"], ["ｦ", "ﾾ"], ["ￂ", "ￇ"], ["ￊ", "ￏ"], ["ￒ", "ￗ"], ["ￚ", "ￜ"]], !1, !1), Ou = _("[", !1), Mu = _("]", !1), Pe = _("{", !1), qe = _("}", !1), je = _("%", !1), Se = _("<", !1), Re = _(">", !1), Le = O(["@", "_"], !1, !1), Oe = _("!", !1), Me = _("(", !1), ze = _(")", !1), Te = _("/", !1), Ze = _("*", !1), We = _("?", !1), Ue = _(":", !1), Ve = _("..", !1), Xe = _("^", !1), Ge = _("struct", !1), Ye = _("target", !1), He = _("euclid", !1), Je = _("slow", !1), Ke = _("rotL", !1), Qe = _("rotR", !1), ut = _("fast", !1), et = _("scale", !1), tt = _("//", !1), zu = O([`
`], !0, !1), rt = _("cat", !1), nt = _("$", !1), st = _("setcps", !1), it = _("setbpm", !1), ft = _("hush", !1), ot = function() {
    return parseFloat(Xt());
  }, at = function(u) {
    const r = u.join("");
    return r === "." || r === "_";
  }, lt = function(u) {
    return new Sr(u.join(""));
  }, ct = function(u) {
    return u;
  }, At = function(u, r) {
    return u.arguments_.stepsPerCycle = r, u;
  }, pt = function(u) {
    return u;
  }, gt = function(u) {
    return u.arguments_.alignment = "polymeter_slowcat", u;
  }, Ft = function(u) {
    return (r) => r.options_.weight = (r.options_.weight ?? 1) + (u ?? 2) - 1;
  }, ht = function(u) {
    return (r) => {
      const s = (r.options_.reps ?? 1) + (u ?? 2) - 1;
      r.options_.reps = s, r.options_.ops = r.options_.ops.filter((o) => o.type_ !== "replicate"), r.options_.ops.push({ type_: "replicate", arguments_: { amount: s } }), r.options_.weight = s;
    };
  }, Bt = function(u, r, s) {
    return (o) => o.options_.ops.push({ type_: "bjorklund", arguments_: { pulse: u, step: r, rotation: s } });
  }, Ct = function(u) {
    return (r) => r.options_.ops.push({ type_: "stretch", arguments_: { amount: u, type: "slow" } });
  }, Dt = function(u) {
    return (r) => r.options_.ops.push({ type_: "stretch", arguments_: { amount: u, type: "fast" } });
  }, dt = function(u) {
    return (r) => r.options_.ops.push({ type_: "degradeBy", arguments_: { amount: u, seed: Bu++ } });
  }, Et = function(u) {
    return (r) => r.options_.ops.push({ type_: "tail", arguments_: { element: u } });
  }, vt = function(u) {
    return (r) => r.options_.ops.push({ type_: "range", arguments_: { element: u } });
  }, $t = function(u, r) {
    const s = new Lr(u, { ops: [], weight: 1, reps: 1 });
    for (const o of r)
      o(s);
    return s;
  }, mt = function(u, r) {
    return new lu(r, "fastcat", void 0, !!u);
  }, _t = function(u) {
    return { alignment: "stack", list: u };
  }, yt = function(u) {
    return { alignment: "rand", list: u, seed: Bu++ };
  }, wt = function(u) {
    return { alignment: "feet", list: u, seed: Bu++ };
  }, bt = function(u, r) {
    return r && r.list.length > 0 ? new lu([u, ...r.list], r.alignment, r.seed) : u;
  }, xt = function(u, r) {
    return new lu(r ? [u, ...r.list] : [u], "polymeter");
  }, It = function(u) {
    return u;
  }, kt = function(u) {
    return { name: "struct", args: { mini: u } };
  }, Nt = function(u) {
    return { name: "target", args: { name: u } };
  }, Pt = function(u, r, s) {
    return { name: "bjorklund", args: { pulse: u, step: parseInt(r) } };
  }, qt = function(u) {
    return { name: "stretch", args: { amount: u } };
  }, jt = function(u) {
    return { name: "shift", args: { amount: "-" + u } };
  }, St = function(u) {
    return { name: "shift", args: { amount: u } };
  }, Rt = function(u) {
    return { name: "stretch", args: { amount: "1/" + u } };
  }, Lt = function(u) {
    return { name: "scale", args: { scale: u.join("") } };
  }, Tu = function(u, r) {
    return r;
  }, Ot = function(u, r) {
    return r.unshift(u), new lu(r, "slowcat");
  }, Mt = function(u) {
    return u;
  }, zt = function(u, r) {
    return new Rr(u.name, u.args, r);
  }, Tt = function(u) {
    return u;
  }, Zt = function(u) {
    return u;
  }, Wt = function(u) {
    return new hu("setcps", { value: u });
  }, Ut = function(u) {
    return new hu("setcps", { value: u / 120 / 2 });
  }, Vt = function() {
    return new hu("hush");
  }, n = i.peg$currPos | 0, $ = n, V = [{ line: 1, column: 1 }], q = n, fu = i.peg$maxFailExpected || [], h = i.peg$silentFails | 0, eu;
  if (i.startRule) {
    if (!(i.startRule in l))
      throw new Error(`Can't start parsing from rule "` + i.startRule + '".');
    a = l[i.startRule];
  }
  function Xt() {
    return t.substring($, n);
  }
  function Zu() {
    return gu($, n);
  }
  function _(u, r) {
    return { type: "literal", text: u, ignoreCase: r };
  }
  function O(u, r, s) {
    return { type: "class", parts: u, inverted: r, ignoreCase: s };
  }
  function Gt() {
    return { type: "end" };
  }
  function pu(u) {
    return { type: "other", description: u };
  }
  function Wu(u) {
    var r = V[u], s;
    if (r)
      return r;
    if (u >= V.length)
      s = V.length - 1;
    else
      for (s = u; !V[--s]; )
        ;
    for (r = V[s], r = {
      line: r.line,
      column: r.column
    }; s < u; )
      t.charCodeAt(s) === 10 ? (r.line++, r.column = 1) : r.column++, s++;
    return V[u] = r, r;
  }
  function gu(u, r, s) {
    var o = Wu(u), B = Wu(r), x = {
      source: f,
      start: {
        offset: u,
        line: o.line,
        column: o.column
      },
      end: {
        offset: r,
        line: B.line,
        column: B.column
      }
    };
    return x;
  }
  function d(u) {
    n < q || (n > q && (q = n, fu = []), fu.push(u));
  }
  function Yt(u, r, s) {
    return new uu(
      uu.buildMessage(u, r),
      u,
      r,
      s
    );
  }
  function Uu() {
    var u;
    return u = jr(), u;
  }
  function M() {
    var u, r;
    return h++, u = n, er(), r = ou(), r !== e ? (ur(), Qt(), $ = u, u = ot()) : (n = u, u = e), h--, u === e && h === 0 && d(de), u;
  }
  function Ht() {
    var u;
    return t.charCodeAt(n) === 46 ? (u = D, n++) : (u = e, h === 0 && d(Ru)), u;
  }
  function Jt() {
    var u;
    return u = t.charAt(n), pe.test(u) ? n++ : (u = e, h === 0 && d(Ee)), u;
  }
  function Kt() {
    var u;
    return u = t.charAt(n), ge.test(u) ? n++ : (u = e, h === 0 && d(ve)), u;
  }
  function Qt() {
    var u, r, s, o, B;
    if (u = n, r = Kt(), r !== e) {
      if (s = t.charAt(n), Fe.test(s) ? n++ : (s = e, h === 0 && d($e)), s === e && (s = null), o = [], B = X(), B !== e)
        for (; B !== e; )
          o.push(B), B = X();
      else
        o = e;
      o !== e ? (r = [r, s, o], u = r) : (n = u, u = e);
    } else
      n = u, u = e;
    return u;
  }
  function ur() {
    var u, r, s, o;
    if (u = n, r = Ht(), r !== e) {
      if (s = [], o = X(), o !== e)
        for (; o !== e; )
          s.push(o), o = X();
      else
        s = e;
      s !== e ? (r = [r, s], u = r) : (n = u, u = e);
    } else
      n = u, u = e;
    return u;
  }
  function ou() {
    var u, r, s, o;
    if (u = tr(), u === e)
      if (u = n, r = Jt(), r !== e) {
        for (s = [], o = X(); o !== e; )
          s.push(o), o = X();
        r = [r, s], u = r;
      } else
        n = u, u = e;
    return u;
  }
  function er() {
    var u;
    return t.charCodeAt(n) === 45 ? (u = v, n++) : (u = e, h === 0 && d(me)), u;
  }
  function tr() {
    var u;
    return t.charCodeAt(n) === 48 ? (u = g, n++) : (u = e, h === 0 && d(_e)), u;
  }
  function X() {
    var u;
    return u = t.charAt(n), he.test(u) ? n++ : (u = e, h === 0 && d(ye)), u;
  }
  function E() {
    var u, r;
    for (h++, u = [], r = t.charAt(n), ju.test(r) ? n++ : (r = e, h === 0 && d(Lu)); r !== e; )
      u.push(r), r = t.charAt(n), ju.test(r) ? n++ : (r = e, h === 0 && d(Lu));
    return h--, r = e, h === 0 && d(we), u;
  }
  function G() {
    var u, r, s, o;
    return u = n, r = E(), t.charCodeAt(n) === 44 ? (s = c, n++) : (s = e, h === 0 && d(be)), s !== e ? (o = E(), r = [r, s, o], u = r) : (n = u, u = e), u;
  }
  function Vu() {
    var u, r, s, o;
    return u = n, r = E(), t.charCodeAt(n) === 124 ? (s = F, n++) : (s = e, h === 0 && d(xe)), s !== e ? (o = E(), r = [r, s, o], u = r) : (n = u, u = e), u;
  }
  function Xu() {
    var u, r, s, o;
    return u = n, r = E(), t.charCodeAt(n) === 46 ? (s = D, n++) : (s = e, h === 0 && d(Ru)), s !== e ? (o = E(), r = [r, s, o], u = r) : (n = u, u = e), u;
  }
  function Y() {
    var u;
    return u = t.charAt(n), Be.test(u) ? n++ : (u = e, h === 0 && d(Ie)), u;
  }
  function au() {
    var u;
    return h++, u = t.charAt(n), Ce.test(u) ? n++ : (u = e, h === 0 && d(Ne)), h--, u === e && h === 0 && d(ke), u;
  }
  function Gu() {
    var u, r, s, o;
    if (u = n, E(), r = [], s = au(), s !== e)
      for (; s !== e; )
        r.push(s), s = au();
    else
      r = e;
    return r !== e ? (s = E(), $ = n, o = at(r), o ? o = e : o = void 0, o !== e ? ($ = u, u = lt(r)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function rr() {
    var u, r, s, o;
    return u = n, E(), t.charCodeAt(n) === 91 ? (r = p, n++) : (r = e, h === 0 && d(Ou)), r !== e ? (E(), s = Ju(), s !== e ? (E(), t.charCodeAt(n) === 93 ? (o = w, n++) : (o = e, h === 0 && d(Mu)), o !== e ? (E(), $ = u, u = ct(s)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function nr() {
    var u, r, s, o, B;
    return u = n, E(), t.charCodeAt(n) === 123 ? (r = P, n++) : (r = e, h === 0 && d(Pe)), r !== e ? (E(), s = Ku(), s !== e ? (E(), t.charCodeAt(n) === 125 ? (o = R, n++) : (o = e, h === 0 && d(qe)), o !== e ? (B = sr(), B === e && (B = null), E(), $ = u, u = At(s, B)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function sr() {
    var u, r, s;
    return u = n, t.charCodeAt(n) === 37 ? (r = su, n++) : (r = e, h === 0 && d(je)), r !== e ? (s = H(), s !== e ? ($ = u, u = pt(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function ir() {
    var u, r, s, o;
    return u = n, E(), t.charCodeAt(n) === 60 ? (r = iu, n++) : (r = e, h === 0 && d(Se)), r !== e ? (E(), s = Ku(), s !== e ? (E(), t.charCodeAt(n) === 62 ? (o = re, n++) : (o = e, h === 0 && d(Re)), o !== e ? (E(), $ = u, u = gt(s)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function H() {
    var u;
    return u = Gu(), u === e && (u = rr(), u === e && (u = nr(), u === e && (u = ir()))), u;
  }
  function Yu() {
    var u;
    return u = fr(), u === e && (u = ar(), u === e && (u = lr(), u === e && (u = cr(), u === e && (u = or(), u === e && (u = Ar(), u === e && (u = pr(), u === e && (u = gr()))))))), u;
  }
  function fr() {
    var u, r, s;
    return u = n, E(), r = t.charAt(n), De.test(r) ? n++ : (r = e, h === 0 && d(Le)), r !== e ? (s = M(), s === e && (s = null), $ = u, u = Ft(s)) : (n = u, u = e), u;
  }
  function or() {
    var u, r, s;
    return u = n, E(), t.charCodeAt(n) === 33 ? (r = ne, n++) : (r = e, h === 0 && d(Oe)), r !== e ? (s = M(), s === e && (s = null), $ = u, u = ht(s)) : (n = u, u = e), u;
  }
  function ar() {
    var u, r, s, o, B, x, j;
    return u = n, t.charCodeAt(n) === 40 ? (r = se, n++) : (r = e, h === 0 && d(Me)), r !== e ? (E(), s = tu(), s !== e ? (E(), o = G(), o !== e ? (E(), B = tu(), B !== e ? (E(), G(), E(), x = tu(), x === e && (x = null), E(), t.charCodeAt(n) === 41 ? (j = ie, n++) : (j = e, h === 0 && d(ze)), j !== e ? ($ = u, u = Bt(s, B, x)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function lr() {
    var u, r, s;
    return u = n, t.charCodeAt(n) === 47 ? (r = fe, n++) : (r = e, h === 0 && d(Te)), r !== e ? (s = H(), s !== e ? ($ = u, u = Ct(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function cr() {
    var u, r, s;
    return u = n, t.charCodeAt(n) === 42 ? (r = oe, n++) : (r = e, h === 0 && d(Ze)), r !== e ? (s = H(), s !== e ? ($ = u, u = Dt(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function Ar() {
    var u, r, s;
    return u = n, t.charCodeAt(n) === 63 ? (r = ae, n++) : (r = e, h === 0 && d(We)), r !== e ? (s = M(), s === e && (s = null), $ = u, u = dt(s)) : (n = u, u = e), u;
  }
  function pr() {
    var u, r, s;
    return u = n, t.charCodeAt(n) === 58 ? (r = le, n++) : (r = e, h === 0 && d(Ue)), r !== e ? (s = H(), s !== e ? ($ = u, u = Et(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function gr() {
    var u, r, s;
    return u = n, t.substr(n, 2) === Eu ? (r = Eu, n += 2) : (r = e, h === 0 && d(Ve)), r !== e ? (s = H(), s !== e ? ($ = u, u = vt(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function tu() {
    var u, r, s, o;
    if (u = n, r = H(), r !== e) {
      for (s = [], o = Yu(); o !== e; )
        s.push(o), o = Yu();
      $ = u, u = $t(r, s);
    } else
      n = u, u = e;
    return u;
  }
  function T() {
    var u, r, s, o;
    if (u = n, t.charCodeAt(n) === 94 ? (r = ce, n++) : (r = e, h === 0 && d(Xe)), r === e && (r = null), s = [], o = tu(), o !== e)
      for (; o !== e; )
        s.push(o), o = tu();
    else
      s = e;
    return s !== e ? ($ = u, u = mt(r, s)) : (n = u, u = e), u;
  }
  function Hu() {
    var u, r, s, o, B;
    if (u = n, r = [], s = n, o = G(), o !== e ? (B = T(), B !== e ? s = B : (n = s, s = e)) : (n = s, s = e), s !== e)
      for (; s !== e; )
        r.push(s), s = n, o = G(), o !== e ? (B = T(), B !== e ? s = B : (n = s, s = e)) : (n = s, s = e);
    else
      r = e;
    return r !== e && ($ = u, r = _t(r)), u = r, u;
  }
  function Fr() {
    var u, r, s, o, B;
    if (u = n, r = [], s = n, o = Vu(), o !== e ? (B = T(), B !== e ? s = B : (n = s, s = e)) : (n = s, s = e), s !== e)
      for (; s !== e; )
        r.push(s), s = n, o = Vu(), o !== e ? (B = T(), B !== e ? s = B : (n = s, s = e)) : (n = s, s = e);
    else
      r = e;
    return r !== e && ($ = u, r = yt(r)), u = r, u;
  }
  function hr() {
    var u, r, s, o, B;
    if (u = n, r = [], s = n, o = Xu(), o !== e ? (B = T(), B !== e ? s = B : (n = s, s = e)) : (n = s, s = e), s !== e)
      for (; s !== e; )
        r.push(s), s = n, o = Xu(), o !== e ? (B = T(), B !== e ? s = B : (n = s, s = e)) : (n = s, s = e);
    else
      r = e;
    return r !== e && ($ = u, r = wt(r)), u = r, u;
  }
  function Ju() {
    var u, r, s;
    return u = n, r = T(), r !== e ? (s = Hu(), s === e && (s = Fr(), s === e && (s = hr())), s === e && (s = null), $ = u, u = bt(r, s)) : (n = u, u = e), u;
  }
  function Ku() {
    var u, r, s;
    return u = n, r = T(), r !== e ? (s = Hu(), s === e && (s = null), $ = u, u = xt(r, s)) : (n = u, u = e), u;
  }
  function Br() {
    var u, r, s, o;
    return u = n, E(), r = Y(), r !== e ? (E(), s = Ju(), s !== e ? (E(), o = Y(), o !== e ? ($ = u, u = It(s)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function Cr() {
    var u;
    return u = yr(), u === e && (u = vr(), u === e && (u = _r(), u === e && (u = dr(), u === e && (u = Er(), u === e && (u = Dr(), u === e && (u = mr(), u === e && (u = $r()))))))), u;
  }
  function Dr() {
    var u, r, s;
    return u = n, t.substr(n, 6) === vu ? (r = vu, n += 6) : (r = e, h === 0 && d(Ge)), r !== e ? (E(), s = J(), s !== e ? ($ = u, u = kt(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function dr() {
    var u, r, s, o, B;
    return u = n, t.substr(n, 6) === $u ? (r = $u, n += 6) : (r = e, h === 0 && d(Ye)), r !== e ? (E(), s = Y(), s !== e ? (o = Gu(), o !== e ? (B = Y(), B !== e ? ($ = u, u = Nt(o)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function Er() {
    var u, r, s, o;
    return u = n, t.substr(n, 6) === mu ? (r = mu, n += 6) : (r = e, h === 0 && d(He)), r !== e ? (E(), s = ou(), s !== e ? (E(), o = ou(), o !== e ? (E(), ou(), $ = u, u = Pt(s, o)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function vr() {
    var u, r, s;
    return u = n, t.substr(n, 4) === _u ? (r = _u, n += 4) : (r = e, h === 0 && d(Je)), r !== e ? (E(), s = M(), s !== e ? ($ = u, u = qt(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function $r() {
    var u, r, s;
    return u = n, t.substr(n, 4) === yu ? (r = yu, n += 4) : (r = e, h === 0 && d(Ke)), r !== e ? (E(), s = M(), s !== e ? ($ = u, u = jt(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function mr() {
    var u, r, s;
    return u = n, t.substr(n, 4) === wu ? (r = wu, n += 4) : (r = e, h === 0 && d(Qe)), r !== e ? (E(), s = M(), s !== e ? ($ = u, u = St(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function _r() {
    var u, r, s;
    return u = n, t.substr(n, 4) === bu ? (r = bu, n += 4) : (r = e, h === 0 && d(ut)), r !== e ? (E(), s = M(), s !== e ? ($ = u, u = Rt(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function yr() {
    var u, r, s, o, B;
    if (u = n, t.substr(n, 5) === xu ? (r = xu, n += 5) : (r = e, h === 0 && d(et)), r !== e)
      if (E(), s = Y(), s !== e) {
        if (o = [], B = au(), B !== e)
          for (; B !== e; )
            o.push(B), B = au();
        else
          o = e;
        o !== e ? (B = Y(), B !== e ? ($ = u, u = Lt(o)) : (n = u, u = e)) : (n = u, u = e);
      } else
        n = u, u = e;
    else
      n = u, u = e;
    return u;
  }
  function Fu() {
    var u, r, s, o;
    if (u = n, t.substr(n, 2) === Iu ? (r = Iu, n += 2) : (r = e, h === 0 && d(tt)), r !== e) {
      for (s = [], o = t.charAt(n), Su.test(o) ? n++ : (o = e, h === 0 && d(zu)); o !== e; )
        s.push(o), o = t.charAt(n), Su.test(o) ? n++ : (o = e, h === 0 && d(zu));
      r = [r, s], u = r;
    } else
      n = u, u = e;
    return u;
  }
  function wr() {
    var u, r, s, o, B, x, j, K;
    if (u = n, t.substr(n, 3) === ku ? (r = ku, n += 3) : (r = e, h === 0 && d(rt)), r !== e)
      if (E(), t.charCodeAt(n) === 91 ? (s = p, n++) : (s = e, h === 0 && d(Ou)), s !== e)
        if (E(), o = J(), o !== e) {
          for (B = [], x = n, j = G(), j !== e ? (K = J(), K !== e ? ($ = x, x = Tu(o, K)) : (n = x, x = e)) : (n = x, x = e); x !== e; )
            B.push(x), x = n, j = G(), j !== e ? (K = J(), K !== e ? ($ = x, x = Tu(o, K)) : (n = x, x = e)) : (n = x, x = e);
          x = E(), t.charCodeAt(n) === 93 ? (j = w, n++) : (j = e, h === 0 && d(Mu)), j !== e ? ($ = u, u = Ot(o, B)) : (n = u, u = e);
        } else
          n = u, u = e;
      else
        n = u, u = e;
    else
      n = u, u = e;
    return u;
  }
  function br() {
    var u;
    return u = wr(), u === e && (u = Br()), u;
  }
  function J() {
    var u, r, s, o, B;
    if (u = n, r = br(), r !== e) {
      for (E(), s = [], o = Fu(); o !== e; )
        s.push(o), o = Fu();
      $ = u, u = Mt(r);
    } else
      n = u, u = e;
    return u === e && (u = n, r = Cr(), r !== e ? (E(), t.charCodeAt(n) === 36 ? (s = Ae, n++) : (s = e, h === 0 && d(nt)), s !== e ? (o = E(), B = J(), B !== e ? ($ = u, u = zt(r, B)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e)), u;
  }
  function xr() {
    var u, r;
    return u = n, r = J(), r !== e && ($ = u, r = Tt(r)), u = r, u === e && (u = Fu()), u;
  }
  function Ir() {
    var u;
    return u = xr(), u;
  }
  function kr() {
    var u, r;
    return u = n, E(), r = Nr(), r === e && (r = Pr(), r === e && (r = qr())), r !== e ? (E(), $ = u, u = Zt(r)) : (n = u, u = e), u;
  }
  function Nr() {
    var u, r, s;
    return u = n, t.substr(n, 6) === Nu ? (r = Nu, n += 6) : (r = e, h === 0 && d(st)), r !== e ? (E(), s = M(), s !== e ? ($ = u, u = Wt(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function Pr() {
    var u, r, s;
    return u = n, t.substr(n, 6) === Pu ? (r = Pu, n += 6) : (r = e, h === 0 && d(it)), r !== e ? (E(), s = M(), s !== e ? ($ = u, u = Ut(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function qr() {
    var u, r;
    return u = n, t.substr(n, 4) === qu ? (r = qu, n += 4) : (r = e, h === 0 && d(ft)), r !== e && ($ = u, r = Vt()), u = r, u;
  }
  function jr() {
    var u;
    return u = Ir(), u === e && (u = kr()), u;
  }
  var Sr = function(u) {
    this.type_ = "atom", this.source_ = u, this.location_ = Zu();
  }, lu = function(u, r, s, o) {
    this.type_ = "pattern", this.arguments_ = { alignment: r, _steps: o }, s !== void 0 && (this.arguments_.seed = s), this.source_ = u;
  }, Rr = function(u, r, s) {
    this.type_ = u, this.arguments_ = r, this.source_ = s;
  }, Lr = function(u, r) {
    this.type_ = "element", this.source_ = u, this.options_ = r, this.location_ = Zu();
  }, hu = function(u, r) {
    this.type_ = "command", this.name_ = u, this.options_ = r;
  }, Bu = 0;
  if (eu = a(), i.peg$library)
    return (
      /** @type {any} */
      {
        peg$result: eu,
        peg$currPos: n,
        peg$FAILED: e,
        peg$maxFailExpected: fu,
        peg$maxFailPos: q
      }
    );
  if (eu !== e && n === t.length)
    return eu;
  throw eu !== e && n < t.length && d(Gt()), Yt(
    fu,
    q < t.length ? t.charAt(q) : null,
    q < t.length ? gu(q, q + 1) : gu(q, q)
  );
}
const Gr = [
  "start"
];
typeof BigInt > "u" && (BigInt = function(t) {
  if (isNaN(t)) throw new Error("");
  return t;
});
const C = BigInt(0), m = BigInt(1), ru = BigInt(2), Du = BigInt(5), N = BigInt(10), zr = 2e3, A = {
  s: m,
  n: C,
  d: m
};
function z(t, i) {
  try {
    t = BigInt(t);
  } catch {
    throw Z();
  }
  return t * i;
}
function S(t) {
  return typeof t == "bigint" ? t : Math.floor(t);
}
function I(t, i) {
  if (i === C)
    throw du();
  const e = Object.create(b.prototype);
  e.s = t < C ? -m : m, t = t < C ? -t : t;
  const f = U(t, i);
  return e.n = t / f, e.d = i / f, e;
}
function Q(t) {
  const i = {};
  let e = t, f = ru, l = Du - m;
  for (; l <= e; ) {
    for (; e % f === C; )
      e /= f, i[f] = (i[f] || C) + m;
    l += m + ru * f++;
  }
  return e !== t ? e > 1 && (i[e] = (i[e] || C) + m) : i[t] = (i[t] || C) + m, i;
}
const k = function(t, i) {
  let e = C, f = m, l = m;
  if (t != null) if (i !== void 0) {
    if (typeof t == "bigint")
      e = t;
    else {
      if (isNaN(t))
        throw Z();
      if (t % 1 !== 0)
        throw Qu();
      e = BigInt(t);
    }
    if (typeof i == "bigint")
      f = i;
    else {
      if (isNaN(i))
        throw Z();
      if (i % 1 !== 0)
        throw Qu();
      f = BigInt(i);
    }
    l = e * f;
  } else if (typeof t == "object") {
    if ("d" in t && "n" in t)
      e = BigInt(t.n), f = BigInt(t.d), "s" in t && (e *= BigInt(t.s));
    else if (0 in t)
      e = BigInt(t[0]), 1 in t && (f = BigInt(t[1]));
    else if (typeof t == "bigint")
      e = t;
    else
      throw Z();
    l = e * f;
  } else if (typeof t == "number") {
    if (isNaN(t))
      throw Z();
    if (t < 0 && (l = -m, t = -t), t % 1 === 0)
      e = BigInt(t);
    else if (t > 0) {
      let a = 1, D = 0, v = 1, g = 1, c = 1, F = 1e7;
      for (t >= 1 && (a = 10 ** Math.floor(1 + Math.log10(t)), t /= a); v <= F && c <= F; ) {
        let p = (D + g) / (v + c);
        if (t === p) {
          v + c <= F ? (e = D + g, f = v + c) : c > v ? (e = g, f = c) : (e = D, f = v);
          break;
        } else
          t > p ? (D += g, v += c) : (g += D, c += v), v > F ? (e = g, f = c) : (e = D, f = v);
      }
      e = BigInt(e) * BigInt(a), f = BigInt(f);
    }
  } else if (typeof t == "string") {
    let a = 0, D = C, v = C, g = C, c = m, F = m, p = t.replace(/_/g, "").match(/\d+|./g);
    if (p === null)
      throw Z();
    if (p[a] === "-" ? (l = -m, a++) : p[a] === "+" && a++, p.length === a + 1 ? v = z(p[a++], l) : p[a + 1] === "." || p[a] === "." ? (p[a] !== "." && (D = z(p[a++], l)), a++, (a + 1 === p.length || p[a + 1] === "(" && p[a + 3] === ")" || p[a + 1] === "'" && p[a + 3] === "'") && (v = z(p[a], l), c = N ** BigInt(p[a].length), a++), (p[a] === "(" && p[a + 2] === ")" || p[a] === "'" && p[a + 2] === "'") && (g = z(p[a + 1], l), F = N ** BigInt(p[a + 1].length) - m, a += 3)) : p[a + 1] === "/" || p[a + 1] === ":" ? (v = z(p[a], l), c = z(p[a + 2], m), a += 3) : p[a + 3] === "/" && p[a + 1] === " " && (D = z(p[a], l), v = z(p[a + 2], l), c = z(p[a + 4], m), a += 5), p.length <= a)
      f = c * F, l = /* void */
      e = g + f * D + F * v;
    else
      throw Z();
  } else if (typeof t == "bigint")
    e = t, l = t, f = m;
  else
    throw Z();
  if (f === C)
    throw du();
  A.s = l < C ? -m : m, A.n = e < C ? -e : e, A.d = f < C ? -f : f;
};
function Tr(t, i, e) {
  let f = m;
  for (; i > C; t = t * t % e, i >>= m)
    i & m && (f = f * t % e);
  return f;
}
function Zr(t, i) {
  for (; i % ru === C; i /= ru)
    ;
  for (; i % Du === C; i /= Du)
    ;
  if (i === m)
    return C;
  let e = N % i, f = 1;
  for (; e !== m; f++)
    if (e = e * N % i, f > zr)
      return C;
  return BigInt(f);
}
function Wr(t, i, e) {
  let f = m, l = Tr(N, e, i);
  for (let a = 0; a < 300; a++) {
    if (f === l)
      return BigInt(a);
    f = f * N % i, l = l * N % i;
  }
  return 0;
}
function U(t, i) {
  if (!t)
    return i;
  if (!i)
    return t;
  for (; ; ) {
    if (t %= i, !t)
      return i;
    if (i %= t, !i)
      return t;
  }
}
function b(t, i) {
  if (k(t, i), this instanceof b)
    t = U(A.d, A.n), this.s = A.s, this.n = A.n / t, this.d = A.d / t;
  else
    return I(A.s * A.n, A.d);
}
var du = function() {
  return new Error("Division by Zero");
}, Z = function() {
  return new Error("Invalid argument");
}, Qu = function() {
  return new Error("Parameters must be integer");
};
b.prototype = {
  s: m,
  n: C,
  d: m,
  /**
   * Calculates the absolute value
   *
   * Ex: new Fraction(-4).abs() => 4
   **/
  abs: function() {
    return I(this.n, this.d);
  },
  /**
   * Inverts the sign of the current fraction
   *
   * Ex: new Fraction(-4).neg() => 4
   **/
  neg: function() {
    return I(-this.s * this.n, this.d);
  },
  /**
   * Adds two rational numbers
   *
   * Ex: new Fraction({n: 2, d: 3}).add("14.9") => 467 / 30
   **/
  add: function(t, i) {
    return k(t, i), I(
      this.s * this.n * A.d + A.s * this.d * A.n,
      this.d * A.d
    );
  },
  /**
   * Subtracts two rational numbers
   *
   * Ex: new Fraction({n: 2, d: 3}).add("14.9") => -427 / 30
   **/
  sub: function(t, i) {
    return k(t, i), I(
      this.s * this.n * A.d - A.s * this.d * A.n,
      this.d * A.d
    );
  },
  /**
   * Multiplies two rational numbers
   *
   * Ex: new Fraction("-17.(345)").mul(3) => 5776 / 111
   **/
  mul: function(t, i) {
    return k(t, i), I(
      this.s * A.s * this.n * A.n,
      this.d * A.d
    );
  },
  /**
   * Divides two rational numbers
   *
   * Ex: new Fraction("-17.(345)").inverse().div(3)
   **/
  div: function(t, i) {
    return k(t, i), I(
      this.s * A.s * this.n * A.d,
      this.d * A.n
    );
  },
  /**
   * Clones the actual object
   *
   * Ex: new Fraction("-17.(345)").clone()
   **/
  clone: function() {
    return I(this.s * this.n, this.d);
  },
  /**
   * Calculates the modulo of two rational numbers - a more precise fmod
   *
   * Ex: new Fraction('4.(3)').mod([7, 8]) => (13/3) % (7/8) = (5/6)
   * Ex: new Fraction(20, 10).mod().equals(0) ? "is Integer"
   **/
  mod: function(t, i) {
    if (t === void 0)
      return I(this.s * this.n % this.d, m);
    if (k(t, i), C === A.n * this.d)
      throw du();
    return I(
      this.s * (A.d * this.n) % (A.n * this.d),
      A.d * this.d
    );
  },
  /**
   * Calculates the fractional gcd of two rational numbers
   *
   * Ex: new Fraction(5,8).gcd(3,7) => 1/56
   */
  gcd: function(t, i) {
    return k(t, i), I(U(A.n, this.n) * U(A.d, this.d), A.d * this.d);
  },
  /**
   * Calculates the fractional lcm of two rational numbers
   *
   * Ex: new Fraction(5,8).lcm(3,7) => 15
   */
  lcm: function(t, i) {
    return k(t, i), A.n === C && this.n === C ? I(C, m) : I(A.n * this.n, U(A.n, this.n) * U(A.d, this.d));
  },
  /**
   * Gets the inverse of the fraction, means numerator and denominator are exchanged
   *
   * Ex: new Fraction([-3, 4]).inverse() => -4 / 3
   **/
  inverse: function() {
    return I(this.s * this.d, this.n);
  },
  /**
   * Calculates the fraction to some integer exponent
   *
   * Ex: new Fraction(-1,2).pow(-3) => -8
   */
  pow: function(t, i) {
    if (k(t, i), A.d === m)
      return A.s < C ? I((this.s * this.d) ** A.n, this.n ** A.n) : I((this.s * this.n) ** A.n, this.d ** A.n);
    if (this.s < C) return null;
    let e = Q(this.n), f = Q(this.d), l = m, a = m;
    for (let D in e)
      if (D !== "1") {
        if (D === "0") {
          l = C;
          break;
        }
        if (e[D] *= A.n, e[D] % A.d === C)
          e[D] /= A.d;
        else return null;
        l *= BigInt(D) ** e[D];
      }
    for (let D in f)
      if (D !== "1") {
        if (f[D] *= A.n, f[D] % A.d === C)
          f[D] /= A.d;
        else return null;
        a *= BigInt(D) ** f[D];
      }
    return A.s < C ? I(a, l) : I(l, a);
  },
  /**
   * Calculates the logarithm of a fraction to a given rational base
   *
   * Ex: new Fraction(27, 8).log(9, 4) => 3/2
   */
  log: function(t, i) {
    if (k(t, i), this.s <= C || A.s <= C) return null;
    const e = {}, f = Q(A.n), l = Q(A.d), a = Q(this.n), D = Q(this.d);
    for (const c in l)
      f[c] = (f[c] || C) - l[c];
    for (const c in D)
      a[c] = (a[c] || C) - D[c];
    for (const c in f)
      c !== "1" && (e[c] = !0);
    for (const c in a)
      c !== "1" && (e[c] = !0);
    let v = null, g = null;
    for (const c in e) {
      const F = f[c] || C, p = a[c] || C;
      if (F === C) {
        if (p !== C)
          return null;
        continue;
      }
      let w = p, P = F;
      const R = U(w, P);
      if (w /= R, P /= R, v === null && g === null)
        v = w, g = P;
      else if (w * g !== v * P)
        return null;
    }
    return v !== null && g !== null ? I(v, g) : null;
  },
  /**
   * Check if two rational numbers are the same
   *
   * Ex: new Fraction(19.6).equals([98, 5]);
   **/
  equals: function(t, i) {
    return k(t, i), this.s * this.n * A.d === A.s * A.n * this.d;
  },
  /**
   * Check if this rational number is less than another
   *
   * Ex: new Fraction(19.6).lt([98, 5]);
   **/
  lt: function(t, i) {
    return k(t, i), this.s * this.n * A.d < A.s * A.n * this.d;
  },
  /**
   * Check if this rational number is less than or equal another
   *
   * Ex: new Fraction(19.6).lt([98, 5]);
   **/
  lte: function(t, i) {
    return k(t, i), this.s * this.n * A.d <= A.s * A.n * this.d;
  },
  /**
   * Check if this rational number is greater than another
   *
   * Ex: new Fraction(19.6).lt([98, 5]);
   **/
  gt: function(t, i) {
    return k(t, i), this.s * this.n * A.d > A.s * A.n * this.d;
  },
  /**
   * Check if this rational number is greater than or equal another
   *
   * Ex: new Fraction(19.6).lt([98, 5]);
   **/
  gte: function(t, i) {
    return k(t, i), this.s * this.n * A.d >= A.s * A.n * this.d;
  },
  /**
   * Compare two rational numbers
   * < 0 iff this < that
   * > 0 iff this > that
   * = 0 iff this = that
   *
   * Ex: new Fraction(19.6).compare([98, 5]);
   **/
  compare: function(t, i) {
    k(t, i);
    let e = this.s * this.n * A.d - A.s * A.n * this.d;
    return (C < e) - (e < C);
  },
  /**
   * Calculates the ceil of a rational number
   *
   * Ex: new Fraction('4.(3)').ceil() => (5 / 1)
   **/
  ceil: function(t) {
    return t = N ** BigInt(t || 0), I(
      S(this.s * t * this.n / this.d) + (t * this.n % this.d > C && this.s >= C ? m : C),
      t
    );
  },
  /**
   * Calculates the floor of a rational number
   *
   * Ex: new Fraction('4.(3)').floor() => (4 / 1)
   **/
  floor: function(t) {
    return t = N ** BigInt(t || 0), I(
      S(this.s * t * this.n / this.d) - (t * this.n % this.d > C && this.s < C ? m : C),
      t
    );
  },
  /**
   * Rounds a rational numbers
   *
   * Ex: new Fraction('4.(3)').round() => (4 / 1)
   **/
  round: function(t) {
    return t = N ** BigInt(t || 0), I(
      S(this.s * t * this.n / this.d) + this.s * ((this.s >= C ? m : C) + ru * (t * this.n % this.d) > this.d ? m : C),
      t
    );
  },
  /**
    * Rounds a rational number to a multiple of another rational number
    *
    * Ex: new Fraction('0.9').roundTo("1/8") => 7 / 8
    **/
  roundTo: function(t, i) {
    k(t, i);
    const e = this.n * A.d, f = this.d * A.n, l = e % f;
    let a = S(e / f);
    return l + l >= f && a++, I(this.s * a * A.n, A.d);
  },
  /**
   * Check if two rational numbers are divisible
   *
   * Ex: new Fraction(19.6).divisible(1.5);
   */
  divisible: function(t, i) {
    return k(t, i), !(!(A.n * this.d) || this.n * A.d % (A.n * this.d));
  },
  /**
   * Returns a decimal representation of the fraction
   *
   * Ex: new Fraction("100.'91823'").valueOf() => 100.91823918239183
   **/
  valueOf: function() {
    return Number(this.s * this.n) / Number(this.d);
  },
  /**
   * Creates a string representation of a fraction with all digits
   *
   * Ex: new Fraction("100.'91823'").toString() => "100.(91823)"
   **/
  toString: function(t) {
    let i = this.n, e = this.d;
    t = t || 15;
    let f = Zr(i, e), l = Wr(i, e, f), a = this.s < C ? "-" : "";
    if (a += S(i / e), i %= e, i *= N, i && (a += "."), f) {
      for (let D = l; D--; )
        a += S(i / e), i %= e, i *= N;
      a += "(";
      for (let D = f; D--; )
        a += S(i / e), i %= e, i *= N;
      a += ")";
    } else
      for (let D = t; i && D--; )
        a += S(i / e), i %= e, i *= N;
    return a;
  },
  /**
   * Returns a string-fraction representation of a Fraction object
   *
   * Ex: new Fraction("1.'3'").toFraction() => "4 1/3"
   **/
  toFraction: function(t) {
    let i = this.n, e = this.d, f = this.s < C ? "-" : "";
    if (e === m)
      f += i;
    else {
      let l = S(i / e);
      t && l > C && (f += l, f += " ", i %= e), f += i, f += "/", f += e;
    }
    return f;
  },
  /**
   * Returns a latex representation of a Fraction object
   *
   * Ex: new Fraction("1.'3'").toLatex() => "\frac{4}{3}"
   **/
  toLatex: function(t) {
    let i = this.n, e = this.d, f = this.s < C ? "-" : "";
    if (e === m)
      f += i;
    else {
      let l = S(i / e);
      t && l > C && (f += l, i %= e), f += "\\frac{", f += i, f += "}{", f += e, f += "}";
    }
    return f;
  },
  /**
   * Returns an array of continued fraction elements
   *
   * Ex: new Fraction("7/8").toContinued() => [0,1,7]
   */
  toContinued: function() {
    let t = this.n, i = this.d, e = [];
    do {
      e.push(S(t / i));
      let f = t % i;
      t = i, i = f;
    } while (t !== m);
    return e;
  },
  simplify: function(t) {
    const i = BigInt(1 / (t || 1e-3) | 0), e = this.abs(), f = e.toContinued();
    for (let l = 1; l < f.length; l++) {
      let a = I(f[l - 1], m);
      for (let v = l - 2; v >= 0; v--)
        a = a.inverse().add(f[v]);
      let D = a.sub(e);
      if (D.n * i < D.d)
        return a.mul(this.s);
    }
    return this;
  }
};
class L {
  constructor(i, e) {
    this.begin = W(i), this.end = W(e);
  }
  get spanCycles() {
    const i = [];
    var e = this.begin;
    const f = this.end, l = f.sam();
    if (e.equals(f))
      return [new L(e, f)];
    for (; f.gt(e); ) {
      if (e.sam().equals(l)) {
        i.push(new L(e, this.end));
        break;
      }
      const a = e.nextSam();
      i.push(new L(e, a)), e = a;
    }
    return i;
  }
  get duration() {
    return this.end.sub(this.begin);
  }
  cycleArc() {
    const i = this.begin.cyclePos(), e = i.add(this.duration);
    return new L(i, e);
  }
  withTime(i) {
    return new L(i(this.begin), i(this.end));
  }
  withEnd(i) {
    return new L(this.begin, i(this.end));
  }
  withCycle(i) {
    const e = this.begin.sam(), f = e.add(i(this.begin.sub(e))), l = e.add(i(this.end.sub(e)));
    return new L(f, l);
  }
  intersection(i) {
    const e = this.begin.max(i.begin), f = this.end.min(i.end);
    if (!e.gt(f) && !(e.equals(f) && (e.equals(this.end) && this.begin.lt(this.end) || e.equals(i.end) && i.begin.lt(i.end))))
      return new L(e, f);
  }
  intersection_e(i) {
    const e = this.intersection(i);
    if (e == null)
      throw "TimeSpans do not intersect";
    return e;
  }
  midpoint() {
    return this.begin.add(this.duration.div(W(2)));
  }
  equals(i) {
    return this.begin.equals(i.begin) && this.end.equals(i.end);
  }
  show() {
    return this.begin.show() + " → " + this.end.show();
  }
}
const Ur = (t) => t.filter((i) => i != null);
b.prototype.sam = function() {
  return this.floor();
};
b.prototype.nextSam = function() {
  return this.sam().add(1);
};
b.prototype.wholeCycle = function() {
  return new L(this.sam(), this.nextSam());
};
b.prototype.cyclePos = function() {
  return this.sub(this.sam());
};
b.prototype.lt = function(t) {
  return this.compare(t) < 0;
};
b.prototype.gt = function(t) {
  return this.compare(t) > 0;
};
b.prototype.lte = function(t) {
  return this.compare(t) <= 0;
};
b.prototype.gte = function(t) {
  return this.compare(t) >= 0;
};
b.prototype.eq = function(t) {
  return this.compare(t) == 0;
};
b.prototype.ne = function(t) {
  return this.compare(t) != 0;
};
b.prototype.max = function(t) {
  return this.gt(t) ? this : t;
};
b.prototype.maximum = function(...t) {
  return t = t.map((i) => new b(i)), t.reduce((i, e) => e.max(i), this);
};
b.prototype.min = function(t) {
  return this.lt(t) ? this : t;
};
b.prototype.mulmaybe = function(t) {
  return t !== void 0 ? this.mul(t) : void 0;
};
b.prototype.divmaybe = function(t) {
  return t !== void 0 ? this.div(t) : void 0;
};
b.prototype.addmaybe = function(t) {
  return t !== void 0 ? this.add(t) : void 0;
};
b.prototype.submaybe = function(t) {
  return t !== void 0 ? this.sub(t) : void 0;
};
b.prototype.show = function() {
  return this.s * this.n + "/" + this.d;
};
b.prototype.or = function(t) {
  return this.eq(0) ? t : this;
};
const W = (t) => b(t), cu = (...t) => {
  if (t = Ur(t), t.length === 0)
    return;
  const i = t.pop();
  return t.reduce(
    (e, f) => e === void 0 || f === void 0 ? void 0 : e.lcm(f),
    i
  );
};
W._original = b;
const ue = 3e-4, Vr = (t, i) => (e, f) => {
  const D = t.source_[f].options_?.ops, v = e.__steps_source;
  if (D)
    for (const g of D)
      switch (g.type_) {
        case "stretch": {
          const c = ["fast", "slow"], { type: F, amount: p } = g.arguments_;
          if (!c.includes(F))
            throw new Error(`mini: stretch: type must be one of ${c.join("|")} but got ${F}`);
          e = y.reify(e)[F](i(p));
          break;
        }
        case "replicate": {
          const { amount: c } = g.arguments_;
          e = y.reify(e), e = e._repeatCycles(c)._fast(c);
          break;
        }
        case "bjorklund": {
          g.arguments_.rotation ? e = e.euclidRot(i(g.arguments_.pulse), i(g.arguments_.step), i(g.arguments_.rotation)) : e = e.euclid(i(g.arguments_.pulse), i(g.arguments_.step));
          break;
        }
        case "degradeBy": {
          e = y.reify(e)._degradeByWith(y.rand.early(ue * g.arguments_.seed), g.arguments_.amount ?? 0.5);
          break;
        }
        case "tail": {
          const c = i(g.arguments_.element);
          e = e.fmap((F) => (p) => Array.isArray(F) ? [...F, p] : [F, p]).appLeft(c);
          break;
        }
        case "range": {
          const c = i(g.arguments_.element);
          e = y.reify(e);
          const F = (w, P, R = 1) => Array.from(
            { length: Math.abs(P - w) / R + 1 },
            (su, iu) => w < P ? w + iu * R : w - iu * R
          );
          e = ((w, P) => w.squeezeBind((R) => P.bind((su) => y.fastcat(...F(R, su)))))(e, c);
          break;
        }
        default:
          console.warn(`operator "${g.type_}" not implemented`);
      }
  return e.__steps_source = e.__steps_source || v, e;
};
function nu(t, i, e, f = 0) {
  e?.(t);
  const l = (a) => nu(a, i, e, f);
  switch (t.type_) {
    case "pattern": {
      const a = t.source_.map((c) => l(c)).map(Vr(t, l)), D = t.arguments_.alignment, v = a.filter((c) => c.__steps_source);
      let g;
      switch (D) {
        case "stack": {
          g = y.stack(...a), v.length && (g._steps = cu(...v.map((c) => W(c._steps))));
          break;
        }
        case "polymeter_slowcat": {
          g = y.stack(...a.map((c) => c._slow(c.__weight))), v.length && (g._steps = cu(...v.map((c) => W(c._steps))));
          break;
        }
        case "polymeter": {
          const c = t.arguments_.stepsPerCycle ? l(t.arguments_.stepsPerCycle).fmap((p) => y.Fraction(p)) : y.pure(y.Fraction(a.length > 0 ? a[0].__weight : 1)), F = a.map((p) => p.fast(c.fmap((w) => w.div(p.__weight))));
          g = y.stack(...F);
          break;
        }
        case "rand": {
          g = y.chooseInWith(y.rand.early(ue * t.arguments_.seed).segment(1), a), v.length && (g._steps = cu(...v.map((c) => W(c._steps))));
          break;
        }
        case "feet": {
          g = y.fastcat(...a);
          break;
        }
        default: {
          if (t.source_.some((F) => !!F.options_?.weight)) {
            const F = t.source_.reduce(
              (p, w) => p.add(w.options_?.weight || y.Fraction(1)),
              y.Fraction(0)
            );
            g = y.timeCat(
              ...t.source_.map((p, w) => [p.options_?.weight || y.Fraction(1), a[w]])
            ), g.__weight = F, g._steps = F, v.length && (g._steps = g._steps.mul(cu(...v.map((p) => W(p._steps)))));
          } else
            g = y.sequence(...a), g._steps = a.length;
          t.arguments_._steps && (g.__steps_source = !0);
        }
      }
      return v.length && (g.__steps_source = !0), g;
    }
    case "element":
      return l(t.source_);
    case "atom": {
      if (t.source_ === "~" || t.source_ === "-")
        return y.silence;
      if (!t.location_)
        return console.warn("no location for", t), t.source_;
      const a = isNaN(Number(t.source_)) ? t.source_ : Number(t.source_);
      if (f === -1)
        return y.pure(a);
      const [D, v] = ee(i, t, f);
      return y.pure(a).withLoc(D, v);
    }
    case "stretch":
      return l(t.source_).slow(l(t.arguments_.amount));
    default:
      return console.warn(`node type "${t.type_}" not implemented -> returning silence`), y.silence;
  }
}
const ee = (t, i, e = 0) => {
  const { start: f, end: l } = i.location_, a = t?.split("").slice(f.offset, l.offset).join(""), [D = 0, v = 0] = a ? a.split(i.source_).map((g) => g.split("").filter((c) => c === " ").length) : [];
  return [f.offset + D + e, l.offset - v + e];
}, Au = (t, i = 0, e = t) => {
  try {
    return Mr(t);
  } catch (f) {
    const l = [f.location.start.offset + i, f.location.end.offset + i], a = e.slice(0, l[0]).split(`
`).length;
    throw new Error(`[mini] parse error at line ${a}: ${f.message}`);
  }
}, Xr = (t, i, e) => {
  const f = Au(t, i, e);
  let l = [];
  return nu(
    f,
    t,
    (a) => {
      a.type_ === "atom" && l.push(a);
    },
    -1
  ), l;
}, Yr = (t, i = 0, e) => Xr(t, i, e).map((f) => ee(t, f, i)), te = (...t) => {
  const i = t.map((e) => {
    const f = `"${e}"`, l = Au(f);
    return nu(l, f);
  });
  return y.sequence(...i);
}, Hr = (t, i) => {
  const e = `"${t}"`, f = Au(e);
  return nu(f, e, null, i);
}, Jr = (t) => {
  const i = Au(t);
  return nu(i, t);
};
function Kr(t) {
  return typeof t == "string" ? te(t) : y.reify(t);
}
function Qr() {
  y.setStringParser(te);
}
export {
  Gr as StartRules,
  uu as SyntaxError,
  ee as getLeafLocation,
  Yr as getLeafLocations,
  Xr as getLeaves,
  Jr as h,
  Hr as m,
  te as mini,
  Au as mini2ast,
  Qr as miniAllStrings,
  Kr as minify,
  Mr as parse,
  nu as patternifyAST
};
