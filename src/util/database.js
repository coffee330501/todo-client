import db from "../renderer/datastore";

export async function find(query) {
  return new Promise((resolve, reject) => {
    db.find(query, function (err, doc) {
      resolve(doc);
    });
  });
}
