import { defineStore } from "pinia";
import { onMounted, ref } from "vue";
import axios from "axios";

export const useCartStore = defineStore("cart", () => {
  // TODO: Build out cart store properties and methods [get, updateItem, removeItem]

  const cart = ref({});
  const loading = ref(false);

  const load = async () => {
    loading.value = true;
    return new Promise((resolve, reject) => {
      axios
        .all([axios.get("/cart.js"), axios.get("/cart?view=inventory")])
        .then(
          axios.spread((response1, response2) => {
            resolve(response1.data);
            resolve(response2.data);
            cart.value = response1.data;
            /* eslint-disable-next-line */
            cart.settings = response2.data;
            loading.value = false;
          })
        )
        .catch((error) => {
          reject(error);
        });
    });
  };

  const updateItem = ({ id, quantity, properties } = {}) => {
    return new Promise((resolve, reject) => {
      axios
        .post("/cart/change.js", { id, quantity, properties })
        .then((response) => {
          resolve(response.data);
          cart.value = response.data;
        })
        .catch((err) => {
          console.log(err);
          reject(new Error("Unable to update your cart."));
        });
    });
  };

  const addItem = ({ id, quantity, properties } = {}) => {
    return new Promise((resolve, reject) => {
      axios
        .post("/cart/add.js", {
          id,
          quantity,
          properties,
        })
        .then(() => {
          axios
            .all([axios.get("/cart.js"), axios.get("/cart?view=inventory")])
            .then(
              axios.spread((response1, response2) => {
                resolve(response1.data);
                resolve(response2.data);
                console.log(response1.data);
                cart.value = response1.data;
                /* eslint-disable-next-line */
                cart.settings = response2.data;
                window.dispatchEvent(new Event("toggleCart"));
              })
            );
        })
        .catch((err) => {
          console.log(err);
          reject(new Error("Unable to add the item to your cart."));
        });
    });
  };

  const addItems = (items) => {
    return new Promise((resolve, reject) => {
      let formData = {
        items: items,
      };
      axios
        .post("/cart/add.js", formData)
        .then(() => {
          axios
            .all([axios.get("/cart.js"), axios.get("/cart?view=inventory")])
            .then(
              axios.spread((response1, response2) => {
                resolve(response1.data);
                resolve(response2.data);
                cart.value = response1.data;
                /* eslint-disable-next-line */
                cart.settings = response2.data;
                window.dispatchEvent(new Event("toggleCart"));
              })
            );
        })
        .catch((err) => {
          console.log(err);
          reject(new Error("Unable to add the item to your cart."));
        });
    });
  };

  const updateNote = (note) => {
    return new Promise((resolve, reject) => {
      axios
        .post("/cart/update.js", {
          note: note,
        })
        .then((response) => {
          resolve(response.data);
          cart.value = response.data;
        })
        .catch((err) => {
          console.log(err);
          reject(new Error("Unable to update cart note."));
        });
    });
  };

  onMounted(() => {
    load();
  });

  return { load, cart, addItem, addItems, loading, updateItem, updateNote };
});
