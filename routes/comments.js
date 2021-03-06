const express = require("express");
const router = express.Router({ mergeParams: true });
const Comment = require("../models/comments"),
    Site = require("../models/sites");
const middleware = require("../middleware");
// const csrf = require("csurf");

// router.use(csrf({ cookie: true }));

//======================================
//comments route
//======================================

router.post("/", middleware.isLoggedIn, async function(req, res) {
    try {
        let sitePromise = Site.findById(req.params.id);
        let commentPromise = Comment.create(req.body.comment);
        let [site, createdComment] = await Promise.all([sitePromise, commentPromise]);
        // console.log(createdComment, 'dfdfjkglu fiogu');
        createdComment.author.id = req.user._id;
        createdComment.author.username = req.user.username;
        createdComment.save();
        site.comments.push(createdComment);
        site.save();
        req.flash("success", "Successfully Added A Comment");
        return res.redirect('/sites/' + req.params.id);
    }
    catch (err) {
        req.flash('error', err.message);
        console.log(err);
        return res.redirect('/');
    }

});

//update route
router.put("/:comment_id", middleware.checkCommentOwnership, async function(req, res) {
    try {
        await Comment.findByIdAndUpdate(req.params.comment_id, { $set: { text: req.body.comment.text } }, { new: true });
        req.flash("success", "Successfully updated");
        res.redirect("/sites/" + req.params.id);
    }
    catch (err) {
        req.flash('error', err.message);
        return res.redirect('back');
    }

});
//destroy route
router.delete("/:comment_id", middleware.checkCommentOwnership, async function(req, res) {
    try {
        await Comment.findByIdAndRemove(req.params.comment_id);
        req.flash("success", "Successfully Deleted");
        res.redirect("/sites/" + req.params.id);
    }
    catch (err) {
        req.flash('error', err.message);
        return res.redirect('back');
    }
});



module.exports = router;
