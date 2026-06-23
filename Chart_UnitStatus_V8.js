(function () {
  class StatusCard extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: "open" });

      this._title = "UNIT STATUS";

      this._titleColor = "#FFFFFF";
      this._subtitleColor = "#7D8CA3";

      this._headerBackground = "#16263B";

      this._titleFontSize = "14px";
      this._valueFontSize = "22px";
      this._subtitleFontSize = "10px";

      this._valueColors = ["#16263B", "#F97316", "#94A3B8"];

      this._customValues = [];

      this.shadowRoot.innerHTML = `
        <style>

        *{
            box-sizing:border-box;
            font-family:Arial,sans-serif;
        }

        .outer{
            width:100%;
            height:100%;
            padding:5px;
            box-sizing:border-box;
        }

        .card{
            width:100%;
            height:100%;

            background:#ffffff;

            border-radius:10px;

            overflow:hidden;

            display:flex;
            flex-direction:column;

            box-shadow:0 0 11px rgba(0,0,0,0.10);
        }

        .header{

            padding:12px 18px;

            font-weight:bold;

            letter-spacing:2px;

            text-transform:uppercase;
        }

        .body{

            flex:1;

            display:flex;

            align-items:center;

            justify-content:space-evenly;

            overflow-x:auto;
        }

        .kpi{

            flex:1;

            text-align:center;

            padding:10px;

            cursor:pointer;
        }

        .divider{

            width:1px;

            height:45px;

            background:#D8D8D8;

            flex-shrink:0;
        }

        .value{

            font-weight:bold;

            margin-bottom:4px;
        }

        .subtitle{

            letter-spacing:2px;

            font-weight:bold;
        }

        </style>

        <div class="outer">
            <div class="card">

                <div
                    id="header"
                    class="header">
                </div>

                <div
                    id="body"
                    class="body">
                </div>

            </div>
        </div>
        `;
    }

    connectedCallback() {
      this.render();
    }

    set myDataBinding(value) {
      this._myDataBinding = value;
      this.render();
    }

    render() {
      const header = this.shadowRoot.getElementById("header");
      const body = this.shadowRoot.getElementById("body");
      header.innerHTML = this._title;
      header.style.background = this._headerBackground;
      header.style.color = this._titleColor;
      header.style.fontSize = this._titleFontSize;

      if (!this._myDataBinding) {
        body.innerHTML = "No Data Binding";

        return;
      }

      if (this._myDataBinding.state !== "success") {
        body.innerHTML = "Loading...";

        return;
      }

      try {
        if (
          !this._myDataBinding ||
          !this._myDataBinding.metadata ||
          !this._myDataBinding.metadata.feeds
        ) {
          body.innerHTML = "Waiting for Data...";
          return;
        }

        const measures = this._myDataBinding.metadata.feeds.measures.values;

        const row = this._myDataBinding.data[0];

        let html = "";

        const resultset = [];

        measures.forEach((measure, index) => {
          const value =
            this._customValues[index] !== undefined
              ? Number(this._customValues[index])
              : Number(row[measure].raw || 0);

          const originalLabel = row[measure].label || measure;

          const label =
            this._subtitleTexts && this._subtitleTexts[index]
              ? this._subtitleTexts[index]
              : originalLabel;

          resultset.push({
            label: label,
            value: value,
          });

          if (index > 0) {
            html += `
                    <div class="divider"></div>
                    `;
          }

          html += `
                <div
                    class="kpi"
                    data-index="${index}">

                    <div
                        class="value"
                        style="
                            color:${this._valueColors[index] || "#16263B"};
                            font-size:${this._valueFontSize};
                        ">
                        ${value.toLocaleString()}
                    </div>

                    <div
                        class="subtitle"
                        style="
                            color:${this._subtitleColor};
                            font-size:${this._subtitleFontSize};
                        ">
                        ${label}
                    </div>

                </div>
                `;
        });

        body.innerHTML = html;

        body.querySelectorAll(".kpi").forEach((item) => {
          item.addEventListener("click", () => {
            const index = Number(item.dataset.index);

            this.dispatchEvent(
              new CustomEvent("onSelect", {
                detail: {
                  index: index,
                  label: resultset[index].label,
                  value: resultset[index].value,
                },
              }),
            );
          });
        });

        this.dispatchEvent(
          new CustomEvent("onResultSet", {
            detail: {
              resultset: resultset,
            },
          }),
        );
      } catch (e) {
        body.innerHTML = "<pre>" + e.message + "</pre>";
      }
    }

    // ==================================
    // METHODS
    // ==================================

    setTitle(value) {
      this._title = value;

      this.render();
    }

    setTitleColor(value) {
      this._titleColor = value;

      this.render();
    }

    setSubtitleColor(value) {
      this._subtitleColor = value;

      this.render();
    }

    setHeaderBackground(value) {
      this._headerBackground = value;

      this.render();
    }

    setValueColor(value) {
      const parts = value.split("|");
      const index = Number(parts[0]);
      const color = parts[1];
      this._valueColors[index] = color;

      this.render();
    }

    setTitleFontSize(value) {
      this._titleFontSize = value;

      this.render();
    }

    setValueFontSize(value) {
      this._valueFontSize = value;

      this.render();
    }

    setSubtitleFontSize(value) {
      this._subtitleFontSize = value;

      this.render();
    }

    setSubtitleText(value) {
      const parts = value.split("|");
      const index = Number(parts[0]);
      const text = parts[1];
      if (!this._subtitleTexts) {
        this._subtitleTexts = [];
      }
      this._subtitleTexts[index] = text;

      this.render();
    }

    setValue(value) {
      const parts = value.split("|");

      const index = Number(parts[0]);
      const amount = Number(parts[1]);

      this._customValues[index] = amount;

      this.render();
    }
  }

  if (!customElements.get("com-max-unitstatus")) {
    customElements.define("com-max-unitstatus", StatusCard);
  }
})();