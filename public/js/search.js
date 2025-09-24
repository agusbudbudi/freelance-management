/**
 * Reusable Search Component
 * A flexible search component that can be used across different sections
 */
class SearchManager {
  constructor(config) {
    this.config = {
      containerId: config.containerId,
      placeholder: config.placeholder || "Search...",
      searchFields: config.searchFields || ["name"],
      onSearch: config.onSearch || (() => {}),
      debounceDelay: config.debounceDelay || 300,
      showResultCount: config.showResultCount || false,
      clearable: config.clearable !== false, // default true
      ...config,
    };

    this.searchTerm = "";
    this.debounceTimer = null;
    this.originalData = [];
    this.filteredData = [];

    this.init();
  }

  /**
   * Initialize the search component
   */
  init() {
    this.createSearchUI();
    this.bindEvents();
  }

  /**
   * Create the search UI elements
   */
  createSearchUI() {
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      console.error(
        `Search container with ID '${this.config.containerId}' not found`
      );
      return;
    }

    const searchWrapper = document.createElement("div");
    searchWrapper.className = "search-wrapper";
    searchWrapper.innerHTML = `
      <div class="search-input-container">
        <i class="uil uil-search search-icon"></i>
        <input 
          type="text" 
          class="search-input" 
          placeholder="${this.config.placeholder}"
          autocomplete="off"
        >
        ${
          this.config.clearable
            ? '<button class="search-clear-btn" title="Clear search"><i class="uil uil-times"></i></button>'
            : ""
        }
      </div>
      ${
        this.config.showResultCount
          ? '<div class="search-result-count"></div>'
          : ""
      }
    `;

    container.appendChild(searchWrapper);

    // Store references to elements
    this.searchInput = searchWrapper.querySelector(".search-input");
    this.clearBtn = searchWrapper.querySelector(".search-clear-btn");
    this.resultCount = searchWrapper.querySelector(".search-result-count");
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    if (!this.searchInput) return;

    // Search input events
    this.searchInput.addEventListener("input", (e) => {
      this.handleSearch(e.target.value);
    });

    this.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.clearSearch();
      }
    });

    // Clear button event
    if (this.clearBtn) {
      this.clearBtn.addEventListener("click", () => {
        this.clearSearch();
      });
    }
  }

  /**
   * Handle search with debouncing
   */
  handleSearch(term) {
    this.searchTerm = term.trim();

    // Clear previous timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = setTimeout(() => {
      this.performSearch();
    }, this.config.debounceDelay);

    // Update clear button visibility
    this.updateClearButtonVisibility();
  }

  /**
   * Perform the actual search
   */
  performSearch() {
    if (!this.searchTerm) {
      this.filteredData = [...this.originalData];
    } else {
      this.filteredData = this.originalData.filter((item) => {
        return this.config.searchFields.some((field) => {
          const value = this.getNestedValue(item, field);
          return (
            value &&
            value
              .toString()
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase())
          );
        });
      });
    }

    // Update result count
    this.updateResultCount();

    // Call the callback function
    this.config.onSearch(this.filteredData, this.searchTerm);
  }

  /**
   * Get nested object value by dot notation
   */
  getNestedValue(obj, path) {
    return path
      .split(".")
      .reduce((current, key) => current && current[key], obj);
  }

  /**
   * Update the result count display
   */
  updateResultCount() {
    if (!this.resultCount) return;

    const count = this.filteredData.length;
    const total = this.originalData.length;

    if (this.searchTerm) {
      this.resultCount.textContent = `${count} of ${total} results`;
      this.resultCount.style.display = "block";
    } else {
      this.resultCount.style.display = "none";
    }
  }

  /**
   * Update clear button visibility
   */
  updateClearButtonVisibility() {
    if (!this.clearBtn) return;

    if (this.searchTerm) {
      this.clearBtn.style.display = "flex";
    } else {
      this.clearBtn.style.display = "none";
    }
  }

  /**
   * Clear the search
   */
  clearSearch() {
    this.searchInput.value = "";
    this.searchTerm = "";
    this.filteredData = [...this.originalData];

    this.updateClearButtonVisibility();
    this.updateResultCount();

    // Call the callback function
    this.config.onSearch(this.filteredData, "");
  }

  /**
   * Set the data to be searched
   */
  setData(data) {
    this.originalData = [...data];
    this.filteredData = [...data];

    // If there's an active search, re-perform it
    if (this.searchTerm) {
      this.performSearch();
    } else {
      this.updateResultCount();
    }
  }

  /**
   * Get current filtered data
   */
  getFilteredData() {
    return this.filteredData;
  }

  /**
   * Get current search term
   */
  getSearchTerm() {
    return this.searchTerm;
  }

  /**
   * Destroy the search component
   */
  destroy() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    const container = document.getElementById(this.config.containerId);
    const searchWrapper = container?.querySelector(".search-wrapper");
    if (searchWrapper) {
      searchWrapper.remove();
    }
  }

  /**
   * Focus the search input
   */
  focus() {
    if (this.searchInput) {
      this.searchInput.focus();
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = SearchManager;
} else {
  window.SearchManager = SearchManager;
}
